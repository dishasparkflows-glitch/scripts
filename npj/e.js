const { encrypt } = require('./s');

const payload = {
  "username": "krishn5454@gmail.com",
  "password": "KRISHN@5454"
};

const encryptedOutput = encrypt(payload);
const [iv, cipher] = encryptedOutput.split(':');

console.log("\n=== PASTE THIS EXACT JSON INTO POSTMAN ===");
console.log(JSON.stringify({
  iv: iv,
  payload: cipher
}, null, 4));
console.log("=========================================\n");
