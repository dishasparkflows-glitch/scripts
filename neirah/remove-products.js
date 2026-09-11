/*
  Script to remove the 6th (last) image from products in MongoDB where
  any colorImages.images array has 6 images.
  Processes products one-by-one and also keeps local 1.json in sync if present.
*/

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { MongoClient, ObjectId } = require("mongodb");

// 1. Load environment variables (.env in script dir or parent)
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
    console.log("Connected to MongoDB");
    const db = client.db(DB_NAME);
    const productsCollection = db.collection(COLLECTION_NAME);

    // Find products where at least one colorImages has a 6th image (images.5 exists)
    const query = { "colorImages.images.5": { $exists: true } };
    const totalMatching = await productsCollection.countDocuments(query);
    console.log(`Found ${totalMatching} products with colorImages having 6 images.\n`);

    if (totalMatching === 0) {
      console.log("No products found matching the criteria. Nothing to update in DB.");
    } else {
      const cursor = productsCollection.find(query);

      let processedCount = 0;
      let updatedCount = 0;
      let totalImagesRemoved = 0;
      const errors = [];

      while (await cursor.hasNext()) {
        const product = await cursor.next();
        processedCount++;

        const imageIdsToRemove = [];

        if (Array.isArray(product.colorImages)) {
          for (const ci of product.colorImages) {
            if (Array.isArray(ci.images) && ci.images.length === 6) {
              const lastImage = ci.images[ci.images.length - 1];
              if (lastImage && lastImage._id) {
                const objId =
                  lastImage._id instanceof ObjectId
                    ? lastImage._id
                    : new ObjectId(lastImage._id);
                imageIdsToRemove.push(objId);
              }
            }
          }
        }

        if (imageIdsToRemove.length === 0) {
          continue;
        }

        try {
          const result = await productsCollection.updateOne(
            { _id: product._id },
            { $pull: { "colorImages.$[].images": { _id: { $in: imageIdsToRemove } } } }
          );

          if (result.modifiedCount > 0) {
            updatedCount++;
            totalImagesRemoved += imageIdsToRemove.length;
            console.log(
              `[${processedCount}/${totalMatching}] ✅ Updated product ${product._id} (${product.sku || product.title || "No Title"}) - Removed ${imageIdsToRemove.length} image(s)`
            );
          } else {
            console.warn(
              `[${processedCount}/${totalMatching}] ⚠️ Product ${product._id} matched but was not modified.`
            );
          }
        } catch (updateErr) {
          console.error(
            `[${processedCount}/${totalMatching}] ❌ Error updating product ${product._id}:`,
            updateErr.message
          );
          errors.push({ productId: product._id, error: updateErr.message });
        }
      }

      console.log("\n================ Database Summary ================");
      console.log(`Candidate products processed: ${processedCount}`);
      console.log(`Successfully updated products: ${updatedCount}`);
      console.log(`Total images removed: ${totalImagesRemoved}`);
      if (errors.length > 0) {
        console.log(`Errors encountered: ${errors.length}`);
      }
      console.log("==================================================\n");
    }

    // Also update 1.json if it exists locally to keep it in sync
    const jsonPath = path.join(__dirname, "1.json");
    if (fs.existsSync(jsonPath)) {
      console.log("Syncing local 1.json file...");
      try {
        const fileContent = fs.readFileSync(jsonPath, "utf8");
        const jsonData = JSON.parse(fileContent);
        let jsonProductsUpdated = 0;
        let jsonImagesRemoved = 0;

        if (Array.isArray(jsonData)) {
          for (const p of jsonData) {
            let productChanged = false;
            if (Array.isArray(p.colorImages)) {
              for (const ci of p.colorImages) {
                if (Array.isArray(ci.images) && ci.images.length === 6) {
                  ci.images.pop();
                  jsonImagesRemoved++;
                  productChanged = true;
                }
              }
            }
            if (productChanged) {
              jsonProductsUpdated++;
            }
          }

          fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), "utf8");
          console.log(
            `✅ 1.json updated: ${jsonProductsUpdated} products modified, ${jsonImagesRemoved} images removed.`
          );
        }
      } catch (jsonErr) {
        console.error("⚠️ Error updating 1.json:", jsonErr.message);
      }
    }
  } catch (err) {
    console.error("Fatal Error:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed.");
  }
}

main();
