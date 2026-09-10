/*
  Script to remove multiple images from products in MongoDB.
  It reads an array of {productId, imageId} objects and performs a $pull
  on the nested `colorImages.images` array for each pair.
*/

const { MongoClient, ObjectId } = require("mongodb");

// ==== Configuration ==== //
const MONGO_URI = "mongodb+srv://neirah:2Hli7juqhwV4reaK@neirah.k3zhzfu.mongodb.net/neirah?retryWrites=true&w=majority";
const DB_NAME = process.env.DB_NAME || "neirah";

// ==== Data to process ==== //
const data = [
  { productId: "6a7a1ed81ab54d5750f45a09", imageId: "6a97bc5535c3fc2640c540fb" },
  { productId: "6a7a21381ab54d5750f496a6", imageId: "6a96bf77c8685e5eb277b7e6" },
  { productId: "6a7a248b1ab54d5750f4d209", imageId: "6a96c39fc8685e5eb277c35c" },
  { productId: "6a7a25c71ab54d5750f50bcc", imageId: "6a96bde0c8685e5eb277af0f" },
];

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(DB_NAME);
    const products = db.collection("products");

    for (const { productId: pidStr, imageId: iidStr } of data) {
      // Validate IDs
      if (!/^[a-fA-F0-9]{24}$/.test(pidStr) || !/^[a-fA-F0-9]{24}$/.test(iidStr)) {
        console.error(`Invalid ID format for productId ${pidStr} or imageId ${iidStr}. Skipping.`);
        continue;
      }
      const productId = new ObjectId(pidStr);
      const imageId = new ObjectId(iidStr);

      // Attempt to pull the image from any matching colorImages entry
      const result = await products.updateOne(
        { _id: productId },
        { $pull: { "colorImages.$[ci].images": { _id: imageId } } },
        { arrayFilters: [{ "ci.images._id": imageId }] }
      );

      if (result.modifiedCount === 1) {
        console.log(`✅ Removed image ${iidStr} from product ${pidStr}`);
      } else if (result.matchedCount === 0) {
        console.warn(`⚠️ Product ${pidStr} not found.`);
      } else {
        console.warn(`⚠️ Image ${iidStr} not found in product ${pidStr} or already removed.`);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

main();
