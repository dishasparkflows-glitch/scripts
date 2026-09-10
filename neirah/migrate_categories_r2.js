const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// 1. Load environment variables (.env in script dir or parent)
const localEnvPath = path.join(__dirname, '.env');
const parentEnvPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else if (fs.existsSync(parentEnvPath)) {
  dotenv.config({ path: parentEnvPath });
} else {
  dotenv.config();
}

// 2. Configuration with fallbacks to provided credentials
const accountId =
  process.env.CLOUDFLARE_R2_ACCOUNT_ID ||
  process.env.CLOUDFLARE_ACCOUNT_ID ||
  '10931f016bd06ab6ceccb990474a3a78';

const accessKeyId =
  process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ||
  process.env.CLOUDFLARE_ACCESS_KEY_ID ||
  'd30a757eae2448b412a53b654f065026';

const secretAccessKey =
  process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
  process.env.CLOUDFLARE_ACCESS_KEY ||
  '2f504d159f016f629e4c210518e50b33642bfea3fdf909ca6a603dcc463b7119';

const bucketName =
  process.env.CLOUDFLARE_R2_BUCKET_NAME ||
  process.env.CLOUDFLARE_BUCKET_NAME ||
  'neirahjewels-media';

const rawPublicUrl =
  process.env.CLOUDFLARE_R2_PUBLIC_URL ||
  process.env.CLOUDFLARE_PUBLIC_URL ||
  'https://pub-b7d5ba116f5742c08d399177ad7efd23.r2.dev';

const publicUrl = rawPublicUrl.replace(/\/+$/, '');

const endpoint =
  process.env.CLOUDFLARE_R2_ENDPOINT ||
  process.env.CLOUDFLARE_ENDPOINT ||
  `https://${accountId}.r2.cloudflarestorage.com`;

const mongoUri =
  process.env.MONGODB_URI ||
  'mongodb+srv://neirah:2Hli7juqhwV4reaK@neirah.k3zhzfu.mongodb.net/neirah?retryWrites=true&w=majority';

const collectionName =
  process.env.MONGODB_COLLECTION ||
  'categories';

const CONFIG = {
  accountId,
  accessKeyId,
  secretAccessKey,
  bucketName,
  publicUrl,
  endpoint,
  mongoUri,
  collectionName,
  cacheFilePath: path.join(__dirname, 'category_migration_cache.json'),
  maxRetries: 3,
};

// 3. Initialize S3 Client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: CONFIG.endpoint,
  credentials: {
    accessKeyId: CONFIG.accessKeyId,
    secretAccessKey: CONFIG.secretAccessKey,
  },
});

// 4. Infer Content-Type
function inferContentType(filename, headerType) {
  if (headerType && headerType !== 'application/octet-stream' && headerType !== 'binary/octet-stream') {
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
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

// 5. Derive new destination key in R2
function deriveNewKey(oldPublicId, oldUrl) {
  let relativeKey = oldPublicId;

  // Extract from URL if public_id missing or needs extension
  if (!relativeKey && oldUrl) {
    try {
      const u = new URL(oldUrl);
      relativeKey = decodeURIComponent(u.pathname.replace(/^\/+/, ''));
    } catch (e) {
      relativeKey = oldUrl;
    }
  }

  // If public_id has no file extension but URL does, preserve the extension
  if (oldUrl && path.extname(relativeKey) === '') {
    try {
      const u = new URL(oldUrl);
      const urlExt = path.extname(u.pathname);
      if (urlExt) {
        relativeKey += urlExt;
      }
    } catch (e) {
      // ignore
    }
  }

  if (!relativeKey) {
    throw new Error(`Unable to derive key for URL: ${oldUrl}`);
  }

  // Replace legacy organization prefix "Rare_Jewellers/" with "Neirah_Jewellers/"
  let newKey = relativeKey.replace(/^Rare_Jewellers\//i, 'Neirah_Jewellers/');
  if (!newKey.startsWith('Neirah_Jewellers/')) {
    newKey = `Neirah_Jewellers/${newKey.replace(/^\/+/, '')}`;
  }

  return newKey;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 6. Transfer single media file to Cloudflare R2
async function transferMedia(oldUrl, oldPublicId, cache, isDryRun, force = false) {
  if (!oldUrl) return null;

  // Check if URL is already pointing to target Cloudflare bucket
  if (!force && oldUrl.startsWith(CONFIG.publicUrl)) {
    const existingKey = oldPublicId || deriveNewKey(oldPublicId, oldUrl);
    return {
      url: oldUrl,
      public_id: existingKey,
      alreadyMigrated: true,
    };
  }

  // Check local cache
  if (!force && cache[oldUrl]) {
    return { ...cache[oldUrl], fromCache: true };
  }

  const newKey = deriveNewKey(oldPublicId, oldUrl);
  const newUrl = `${CONFIG.publicUrl}/${newKey}`;

  if (isDryRun) {
    return {
      url: newUrl,
      public_id: newKey,
      dryRun: true,
      size: 0,
    };
  }

  let attempt = 0;
  let lastError = null;

  while (attempt < CONFIG.maxRetries) {
    attempt++;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

      const response = await fetch(oldUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MediaMigration/1.0',
        },
      });
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

      const result = {
        url: newUrl,
        public_id: newKey,
        size: buffer.length,
        uploaded: true,
      };

      cache[oldUrl] = result;
      return result;
    } catch (err) {
      lastError = err;
      if (attempt < CONFIG.maxRetries) {
        const waitTime = Math.pow(2, attempt) * 600;
        console.warn(`  [Retry ${attempt}/${CONFIG.maxRetries}] for ${oldUrl}: ${err.message}. Retrying in ${waitTime}ms...`);
        await sleep(waitTime);
      }
    }
  }

  console.error(`  [FAILED] Transfer failed for ${oldUrl}: ${lastError.message}`);
  return null;
}

// 7. Main Runner
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isForce = args.includes('--force');

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node migrate_categories_r2.js [options]

Options:
  --dry-run      Preview actions without uploading files or updating database
  --force        Force re-upload even if URL already matches new Cloudflare URL
  --help, -h     Show this help message
`);
    process.exit(0);
  }

  console.log('='.repeat(75));
  console.log('         NEIRAH CATEGORIES -> CLOUDFLARE R2 MIGRATION SCRIPT        ');
  console.log('='.repeat(75));
  console.log(`MongoDB URI:          ${CONFIG.mongoUri.replace(/:([^@]+)@/, ':****@')}`);
  console.log(`MongoDB Collection:   ${CONFIG.collectionName}`);
  console.log(`Cloudflare Account ID:${CONFIG.accountId}`);
  console.log(`Cloudflare Bucket:    ${CONFIG.bucketName}`);
  console.log(`Cloudflare Public URL:${CONFIG.publicUrl}`);
  console.log(`Cloudflare Endpoint:  ${CONFIG.endpoint}`);
  console.log(`Dry Run Mode:         ${isDryRun ? 'YES (No writes)' : 'NO (Live Upload & DB Update)'}`);
  console.log(`Force Re-upload:      ${isForce ? 'YES' : 'NO'}`);
  console.log('='.repeat(75));

  // Load migration cache
  let cache = {};
  if (fs.existsSync(CONFIG.cacheFilePath)) {
    try {
      cache = JSON.parse(fs.readFileSync(CONFIG.cacheFilePath, 'utf8'));
      console.log(`Loaded cache with ${Object.keys(cache).length} previously uploaded files.`);
    } catch (e) {
      console.warn('Could not parse cache file, starting fresh.');
    }
  }

  const saveCache = () => {
    if (!isDryRun) {
      try {
        fs.writeFileSync(CONFIG.cacheFilePath, JSON.stringify(cache, null, 2), 'utf8');
      } catch (err) {
        console.warn('Failed to save cache file:', err.message);
      }
    }
  };

  // Connect to MongoDB
  console.log('\nConnecting to MongoDB...');
  await mongoose.connect(CONFIG.mongoUri);
  console.log('MongoDB connected successfully.\n');

  const db = mongoose.connection.db;
  const categoriesCol = db.collection(CONFIG.collectionName);

  const categories = await categoriesCol.find({}).toArray();
  console.log(`Found ${categories.length} category records in database.\n`);

  let totalCategoriesUpdated = 0;
  let totalMediaUploaded = 0;
  let totalMediaCached = 0;
  let totalMediaSkipped = 0;
  let totalMediaFailed = 0;

  const startTime = Date.now();

  for (let idx = 0; idx < categories.length; idx++) {
    const cat = categories[idx];
    const catNum = idx + 1;
    console.log(`---------------------------------------------------------------------------`);
    console.log(`[${catNum}/${categories.length}] Processing Category: "${cat.name}" (ID: ${cat._id})`);

    let hasChanges = false;

    // 1. Process `images` array
    if (cat.images && Array.isArray(cat.images) && cat.images.length > 0) {
      for (let i = 0; i < cat.images.length; i++) {
        const img = cat.images[i];
        if (!img || !img.url) continue;

        console.log(`  -> Image [${i + 1}/${cat.images.length}] ("${img.title || 'Untitled'}"): ${img.url}`);
        const result = await transferMedia(img.url, img.public_id, cache, isDryRun, isForce);

        if (result) {
          if (result.uploaded) totalMediaUploaded++;
          else if (result.fromCache) totalMediaCached++;
          else if (result.alreadyMigrated) totalMediaSkipped++;

          if (img.url !== result.url || img.public_id !== result.public_id) {
            console.log(`     Updated: [${result.public_id}]`);
            img.url = result.url;
            img.public_id = result.public_id;
            hasChanges = true;
          } else {
            console.log(`     Already up to date.`);
          }
        } else {
          totalMediaFailed++;
          console.warn(`     Retaining original URL due to transfer error.`);
        }
      }
    }

    // 2. Process root `sizeChart`
    if (cat.sizeChart && cat.sizeChart.url) {
      console.log(`  -> Category SizeChart: ${cat.sizeChart.url}`);
      const result = await transferMedia(cat.sizeChart.url, cat.sizeChart.public_id, cache, isDryRun, isForce);

      if (result) {
        if (result.uploaded) totalMediaUploaded++;
        else if (result.fromCache) totalMediaCached++;
        else if (result.alreadyMigrated) totalMediaSkipped++;

        if (cat.sizeChart.url !== result.url || cat.sizeChart.public_id !== result.public_id) {
          console.log(`     Updated: [${result.public_id}]`);
          cat.sizeChart.url = result.url;
          cat.sizeChart.public_id = result.public_id;
          hasChanges = true;
        } else {
          console.log(`     Already up to date.`);
        }
      } else {
        totalMediaFailed++;
        console.warn(`     Retaining original SizeChart URL due to transfer error.`);
      }
    }

    // 3. Process `subTypes` sizeChart
    if (cat.subTypes && Array.isArray(cat.subTypes) && cat.subTypes.length > 0) {
      for (let s = 0; s < cat.subTypes.length; s++) {
        const sub = cat.subTypes[s];
        if (sub && sub.sizeChart && sub.sizeChart.url) {
          console.log(`  -> SubType "${sub.name}" SizeChart: ${sub.sizeChart.url}`);
          const result = await transferMedia(sub.sizeChart.url, sub.sizeChart.public_id, cache, isDryRun, isForce);

          if (result) {
            if (result.uploaded) totalMediaUploaded++;
            else if (result.fromCache) totalMediaCached++;
            else if (result.alreadyMigrated) totalMediaSkipped++;

            if (sub.sizeChart.url !== result.url || sub.sizeChart.public_id !== result.public_id) {
              console.log(`     Updated: [${result.public_id}]`);
              sub.sizeChart.url = result.url;
              sub.sizeChart.public_id = result.public_id;
              hasChanges = true;
            } else {
              console.log(`     Already up to date.`);
            }
          } else {
            totalMediaFailed++;
            console.warn(`     Retaining original SubType SizeChart URL due to transfer error.`);
          }
        }
      }
    }

    // Save changes to database
    if (hasChanges) {
      if (!isDryRun) {
        const updateFields = {
          images: cat.images,
        };
        if (cat.sizeChart !== undefined) {
          updateFields.sizeChart = cat.sizeChart;
        }
        if (cat.subTypes !== undefined) {
          updateFields.subTypes = cat.subTypes;
        }

        await categoriesCol.updateOne(
          { _id: cat._id },
          { $set: updateFields }
        );
        console.log(`  => Successfully updated category in MongoDB!`);
      } else {
        console.log(`  => [DRY RUN] Would update category in MongoDB.`);
      }
      totalCategoriesUpdated++;
    } else {
      console.log(`  => No database update required for this category.`);
    }

    // Persist cache after each category
    saveCache();
  }

  // Final cache write
  saveCache();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(75));
  console.log('                          MIGRATION SUMMARY                         ');
  console.log('='.repeat(75));
  console.log(`Total Categories Scanned:  ${categories.length}`);
  console.log(`Categories Updated in DB:  ${totalCategoriesUpdated}`);
  console.log(`New Files Uploaded to R2:  ${totalMediaUploaded}`);
  console.log(`Files Loaded from Cache:   ${totalMediaCached}`);
  console.log(`Files Already Migrated:    ${totalMediaSkipped}`);
  console.log(`Files Failed / Skipped:    ${totalMediaFailed}`);
  console.log(`Total Execution Time:      ${durationSec}s`);
  console.log('='.repeat(75));
}

main().catch((err) => {
  console.error('\nFatal Error during migration:', err);
  if (mongoose.connection.readyState !== 0) {
    mongoose.disconnect();
  }
  process.exit(1);
});
