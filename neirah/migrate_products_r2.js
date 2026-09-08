const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Configuration
const CONFIG = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '922fd6304f87348d80a8e12fe0a729de',
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || '4bd18bce6abe64780ec92c118b971e5e',
  secretAccessKey: process.env.CLOUDFLARE_ACCESS_KEY || '80685f4cb4ca0b69e1bfc0409968014edc1de910c232c91267eec0f3d5c30e80',
  endpoint: process.env.CLOUDFLARE_ENDPOINT || 'https://922fd6304f87348d80a8e12fe0a729de.r2.cloudflarestorage.com',
  publicUrl: (process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.CLOUDFLARE_URL || 'https://pub-82427c7fd20e4acaa4bdb3b933c0a3bf.r2.dev').replace(/\/+$/, ''),
  bucketName: process.env.CLOUDFLARE_BUCKET_NAME || 'telecrm',
  region: process.env.CLOUDFLARE_REGION || 'auto',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/neirah',
  collectionName: process.env.MONGODB_COLLECTION || 'products',
  productsFilePath: path.join(__dirname, 'products.json'),
  cacheFilePath: path.join(__dirname, 'migration_cache.json'),
  defaultConcurrency: 6,
  maxRetries: 3,
};

// Initialize S3 Client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: CONFIG.endpoint,
  credentials: {
    accessKeyId: CONFIG.accessKeyId,
    secretAccessKey: CONFIG.secretAccessKey,
  },
});

// Infer Content-Type from filename extension or fallback
function inferContentType(filename, headerType) {
  if (headerType && headerType !== 'application/octet-stream') {
    return headerType;
  }
  const ext = path.extname(filename || '').toLowerCase();
  const mimeMap = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
  };
  return mimeMap[ext] || 'image/jpeg';
}

// Convert old public_id / url into new R2 key
function deriveNewKey(oldPublicId, oldUrl) {
  let relativeKey = oldPublicId;
  if (!relativeKey && oldUrl) {
    try {
      const u = new URL(oldUrl);
      relativeKey = decodeURIComponent(u.pathname.replace(/^\/+/, ''));
    } catch (e) {
      relativeKey = oldUrl;
    }
  }

  if (!relativeKey) {
    throw new Error('Unable to derive key for URL: ' + oldUrl);
  }

  // Replace legacy organization prefix if present
  let newKey = relativeKey.replace(/^Rare_Jewellers\//i, 'Neirah_Jewellers/');
  if (!newKey.startsWith('Neirah_Jewellers/')) {
    newKey = `Neirah_Jewellers/${newKey.replace(/^\/+/, '')}`;
  }
  return newKey;
}

// Helper for delay in backoff
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Download from old URL and upload to R2
async function transferMedia(oldUrl, oldPublicId, cache, isDryRun) {
  if (cache[oldUrl]) {
    return cache[oldUrl];
  }

  const newKey = deriveNewKey(oldPublicId, oldUrl);
  const newUrl = `${CONFIG.publicUrl}/${newKey}`;

  if (isDryRun) {
    return { url: newUrl, public_id: newKey, cached: false, dryRun: true };
  }

  let attempt = 0;
  let lastError = null;

  while (attempt < CONFIG.maxRetries) {
    attempt++;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(oldUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = inferContentType(newKey, response.headers.get('content-type'));

      await s3Client.send(
        new PutObjectCommand({
          Bucket: CONFIG.bucketName,
          Key: newKey,
          Body: buffer,
          ContentType: contentType,
        })
      );

      const result = { url: newUrl, public_id: newKey, size: buffer.length };
      cache[oldUrl] = result;
      return result;
    } catch (err) {
      lastError = err;
      if (attempt < CONFIG.maxRetries) {
        const waitTime = Math.pow(2, attempt) * 500;
        await sleep(waitTime);
      }
    }
  }

  throw new Error(`Failed to transfer ${oldUrl} after ${CONFIG.maxRetries} attempts: ${lastError.message}`);
}

// Execute tasks with bounded concurrency
async function runWithConcurrency(tasks, limit) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const cur = index++;
      results[cur] = await tasks[cur]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// Main migration function
async function main() {
  const args = process.argv.slice(2);
  let limit = Infinity;
  let skip = 0;
  let concurrency = CONFIG.defaultConcurrency;
  let isDryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[++i], 10);
    } else if (args[i] === '--skip' && args[i + 1]) {
      skip = parseInt(args[++i], 10);
    } else if (args[i] === '--concurrency' && args[i + 1]) {
      concurrency = parseInt(args[++i], 10);
    } else if (args[i] === '--dry-run') {
      isDryRun = true;
    }
  }

  console.log('='.repeat(70));
  console.log('              NEIRAH PRODUCT & R2 MIGRATION SCRIPT              ');
  console.log('='.repeat(70));
  console.log(`MongoDB URI:       ${CONFIG.mongoUri}`);
  console.log(`MongoDB Collection: ${CONFIG.collectionName}`);
  console.log(`Cloudflare Bucket:  ${CONFIG.bucketName}`);
  console.log(`Cloudflare Base:    ${CONFIG.publicUrl}`);
  console.log(`Concurrency Limit:  ${concurrency}`);
  console.log(`Dry Run Mode:       ${isDryRun ? 'YES (No writes)' : 'NO (Live writes)'}`);
  if (limit !== Infinity) console.log(`Limit:              ${limit} products`);
  if (skip > 0) console.log(`Skip:               ${skip} products`);
  console.log('-'.repeat(70));

  // Load products.json
  if (!fs.existsSync(CONFIG.productsFilePath)) {
    console.error(`Error: File not found: ${CONFIG.productsFilePath}`);
    process.exit(1);
  }

  console.log(`Reading products from: ${CONFIG.productsFilePath}`);
  const rawProducts = JSON.parse(fs.readFileSync(CONFIG.productsFilePath, 'utf8'));
  console.log(`Loaded ${rawProducts.length} total products from file.`);

  // Slice products according to skip/limit
  const selectedProducts = rawProducts.slice(skip, skip + limit);
  console.log(`Selected ${selectedProducts.length} products to process.\n`);

  // Load migration cache
  let cache = {};
  if (fs.existsSync(CONFIG.cacheFilePath)) {
    try {
      cache = JSON.parse(fs.readFileSync(CONFIG.cacheFilePath, 'utf8'));
      console.log(`Loaded existing cache with ${Object.keys(cache).length} files.`);
    } catch (e) {
      console.warn('Failed to parse cache file, starting fresh.');
    }
  }

  // Save cache helper
  let unsavedCacheOps = 0;
  const saveCache = (force = false) => {
    if (!isDryRun && (force || unsavedCacheOps >= 10)) {
      fs.writeFileSync(CONFIG.cacheFilePath, JSON.stringify(cache, null, 2), 'utf8');
      unsavedCacheOps = 0;
    }
  };

  // Connect to MongoDB
  let mongoClient = null;
  let db = null;
  if (!isDryRun) {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(CONFIG.mongoUri);
    mongoClient = mongoose.connection.getClient();
    db = mongoose.connection.db;
    console.log('Connected to MongoDB successfully.\n');
  }

  const { EJSON } = mongoose.mongo.BSON;

  let totalImagesProcessed = 0;
  let totalImagesUploaded = 0;
  let totalImagesCached = 0;
  let totalProductsSaved = 0;
  let totalProductsFailed = 0;
  const startTime = Date.now();

  for (let i = 0; i < selectedProducts.length; i++) {
    const rawProd = selectedProducts[i];
    const prodIndex = skip + i + 1;
    const sku = rawProd.sku || 'NO-SKU';
    const title = (rawProd.title || '').slice(0, 40);

    // Deep clone product to avoid mutating raw source
    const product = JSON.parse(JSON.stringify(rawProd));

    // Gather all media transfer tasks for this product
    const mediaTasks = [];

    if (product.colorImages && Array.isArray(product.colorImages)) {
      for (const ci of product.colorImages) {
        if (ci.images && Array.isArray(ci.images)) {
          for (const img of ci.images) {
            if (img && img.url) {
              mediaTasks.push(async () => {
                const wasCached = Boolean(cache[img.url]);
                const res = await transferMedia(img.url, img.public_id, cache, isDryRun);
                img.url = res.url;
                img.public_id = res.public_id;
                if (wasCached) totalImagesCached++;
                else {
                  totalImagesUploaded++;
                  unsavedCacheOps++;
                }
                totalImagesProcessed++;
              });
            }
          }
        }

        if (ci.vtoImage && ci.vtoImage.url) {
          mediaTasks.push(async () => {
            const wasCached = Boolean(cache[ci.vtoImage.url]);
            const res = await transferMedia(ci.vtoImage.url, ci.vtoImage.public_id, cache, isDryRun);
            ci.vtoImage.url = res.url;
            ci.vtoImage.public_id = res.public_id;
            if (wasCached) totalImagesCached++;
            else {
              totalImagesUploaded++;
              unsavedCacheOps++;
            }
            totalImagesProcessed++;
          });
        }
      }
    }

    try {
      // Process all images for this product with controlled concurrency
      if (mediaTasks.length > 0) {
        await runWithConcurrency(mediaTasks, concurrency);
      }

      // Save cache after product media is done
      saveCache();

      // Convert Extended JSON ($oid, $date) to native BSON ObjectId and Date
      const deserialized = EJSON.deserialize(product);

      // Insert/Upsert into MongoDB
      if (!isDryRun && db) {
        await db.collection(CONFIG.collectionName).updateOne(
          { _id: deserialized._id },
          { $set: deserialized },
          { upsert: true }
        );
      }

      totalProductsSaved++;
      console.log(
        `[${prodIndex}/${rawProducts.length}] SKU: ${sku} | "${title}" | Media: ${mediaTasks.length} items -> OK (DB Saved)`
      );
    } catch (prodErr) {
      totalProductsFailed++;
      console.error(
        `[${prodIndex}/${rawProducts.length}] ERROR on SKU: ${sku} ("${title}"):`,
        prodErr.message
      );
    }
  }

  // Final cache save
  saveCache(true);

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n' + '='.repeat(70));
  console.log('                          MIGRATION SUMMARY                     ');
  console.log('='.repeat(70));
  console.log(`Total Products Attempted: ${selectedProducts.length}`);
  console.log(`Products Successfully Saved: ${totalProductsSaved}`);
  console.log(`Products Failed:            ${totalProductsFailed}`);
  console.log(`Total Media Processed:      ${totalImagesProcessed}`);
  console.log(`Media Uploaded to R2:       ${totalImagesUploaded}`);
  console.log(`Media from Cache:           ${totalImagesCached}`);
  console.log(`Elapsed Time:               ${durationSec}s`);
  console.log('='.repeat(70));
}

main().catch((err) => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});
