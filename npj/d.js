const { decrypt } = require('./s');
const fs = require('fs');

const data = {
    "iv": "tCjKbk1IRL8T96X+jBwYBQ==",
    "payload": "xRm5uR1qj5oPEBTftH1Vb2QRFVs9mSKnbbxRQevhY1DZoz2sxf+TfpNuaqXj2PqOnpDPEMa2Uu/jS1ikU0e8raFy4f0CbfSE8Y+dIzHa/uIqMfOUMHu+pQSQY+orlfBu"
};

// We just pass it in the iv:payload format that s.js expects natively
const encryptedString = `${data.iv}:${data.payload}`;

const decryptedOutput = decrypt(encryptedString);
console.log("=== DECRYPTED OUTPUT ===");
console.log(decryptedOutput);

// Ensure it is saved as pretty-printed JSON if it's a valid JSON string
try {
  const jsonObj = JSON.parse(decryptedOutput);
  fs.writeFileSync('decrypt.json', JSON.stringify(jsonObj, null, 2));
  console.log("\n[Success] Decrypted output saved to decrypt.json!");
} catch (e) {
  // If not valid JSON, just write the raw string
  fs.writeFileSync('decrypt.json', decryptedOutput);
  console.log("\n[Success] Decrypted raw output saved to decrypt.json!");
}
