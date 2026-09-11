/*
  Script to check ALL products in MongoDB and remove the last (6th) image 
  from any colorImages.images array that has 6 images.

  Rule:
  - Scans ALL products in the collection (no hardcoded product IDs).
  - For each product: checks colorImages array.
  - If inside any colorImages entry, images array has exactly 6 images:
    removes the last (6th) image from that images array.
  - Updates each matching product one-by-one in MongoDB.
  - Also keeps local 1.json in sync if present.
*/

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");

// ==== Load Environment Variables ==== //
const localEnvPath = path.join(__dirname, ".env");
const parentEnvPath = path.join(__dirname, "..", ".env");

if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else if (fs.existsSync(parentEnvPath)) {
  dotenv.config({ path: parentEnvPath });
} else {
  dotenv.config();
}

// ==== Configuration ==== //
const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://neirah:2Hli7juqhwV4reaK@neirah.k3zhzfu.mongodb.net/neirah?retryWrites=true&w=majority";
const DB_NAME = process.env.DB_NAME || "neirah";
const COLLECTION_NAME =
  process.env.MONGODB_PRODUCTS_COLLECTION ||
  process.env.MONGODB_COLLECTION_PRODUCTS ||
  "products";

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully.");
    const db = client.db(DB_NAME);
    const productsCollection = db.collection(COLLECTION_NAME);

    // 1. Fetch total products count to check ALL products
    const totalProducts = await productsCollection.countDocuments({});
    console.log(`Checking ALL ${totalProducts} products in collection '${COLLECTION_NAME}'...\n`);

    // Stream through ALL products in the database
    const cursor = productsCollection.find({});

    let scannedCount = 0;
    let updatedProductsCount = 0;
    let skippedProductsCount = 0;
    let totalImagesRemoved = 0;
    const errors = [];

    while (await cursor.hasNext()) {
      const product = await cursor.next();
      scannedCount++;

      let hasModifications = false;
      let removedCountForThisProduct = 0;
      const details = [];

      // Check if product has colorImages array
      if (Array.isArray(product.colorImages)) {
        for (let i = 0; i < product.colorImages.length; i++) {
          const ci = product.colorImages[i];

          // Rule: if inside colorImages, images array has 6 images, remove the last image
          if (Array.isArray(ci.images) && ci.images.length === 6) {
            const removed = ci.images.pop(); // Removes the 6th (last) image
            removedCountForThisProduct++;
            hasModifications = true;
            details.push({
              colorVariantIndex: i,
              removedImageId: removed?._id || "N/A",
              removedUrl: removed?.url || "N/A"
            });
          }
        }
      }

      // Update product one-by-one if any 6th image was removed
      if (hasModifications) {
        try {
          const updateResult = await productsCollection.updateOne(
            { _id: product._id },
            { $set: { colorImages: product.colorImages } }
          );

          if (updateResult.modifiedCount > 0) {
            updatedProductsCount++;
            totalImagesRemoved += removedCountForThisProduct;
            console.log(
              `[${scannedCount}/${totalProducts}] ✅ UPDATED Product ID: ${product._id} | SKU: ${product.sku || "N/A"} | Title: "${product.title || "No Title"}"`
            );
            console.log(`     -> Removed ${removedCountForThisProduct} last image(s) from colorImages variants.`);
          } else {
            console.warn(
              `[${scannedCount}/${totalProducts}] ⚠️ Product ID: ${product._id} matched but 0 documents modified.`
            );
          }
        } catch (err) {
          console.error(
            `[${scannedCount}/${totalProducts}] ❌ Error updating product ${product._id}:`,
            err.message
          );
          errors.push({ productId: product._id, error: err.message });
        }
      } else {
        skippedProductsCount++;
      }
    }

    console.log("\n==================================================");
    console.log("              DATABASE PROCESS SUMMARY             ");
    console.log("==================================================");
    console.log(`Total products scanned:        ${scannedCount}`);
    console.log(`Products updated:              ${updatedProductsCount}`);
    console.log(`Products skipped (clean):      ${skippedProductsCount}`);
    console.log(`Total last images removed:     ${totalImagesRemoved}`);
    if (errors.length > 0) {
      console.log(`Errors encountered:            ${errors.length}`);
    }
    console.log("==================================================\n");

    // 2. Also check and update local 1.json if it exists
    const jsonFilePath = path.join(__dirname, "1.json");
    if (fs.existsSync(jsonFilePath)) {
      console.log("Checking ALL products in local 1.json to keep it in sync...");
      try {
        const fileContent = fs.readFileSync(jsonFilePath, "utf8");
        const jsonData = JSON.parse(fileContent);

        let jsonTotalScanned = 0;
        let jsonUpdatedCount = 0;
        let jsonImagesRemoved = 0;

        if (Array.isArray(jsonData)) {
          jsonTotalScanned = jsonData.length;
          for (const p of jsonData) {
            let pModified = false;
            if (Array.isArray(p.colorImages)) {
              for (const ci of p.colorImages) {
                if (Array.isArray(ci.images) && ci.images.length === 6) {
                  ci.images.pop(); // Remove 6th image
                  jsonImagesRemoved++;
                  pModified = true;
                }
              }
            }
            if (pModified) {
              jsonUpdatedCount++;
            }
          }

          if (jsonUpdatedCount > 0) {
            fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), "utf8");
            console.log(
              `✅ 1.json updated: ${jsonUpdatedCount} of ${jsonTotalScanned} products modified, ${jsonImagesRemoved} images removed.`
            );
          } else {
            console.log(`✅ 1.json is already clean: All ${jsonTotalScanned} products have 5 or fewer images.`);
          }
        }
      } catch (jsonErr) {
        console.error("⚠️ Error processing 1.json:", jsonErr.message);
      }
    }
  } catch (fatalErr) {
    console.error("Fatal Error:", fatalErr);
  } finally {
    await client.close();
    console.log("MongoDB connection closed.");
  }
}

main();
