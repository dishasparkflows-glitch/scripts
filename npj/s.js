const crypto = require('crypto');

// Ensure you have these in your .env or fallback for development
// Using 32 bytes key and 16 bytes IV for AES-256-CBC
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';

/**
 * Encrypts a text string or object using AES-256-CBC with a dynamic IV
 * @param {string|object} data - The text or object to encrypt
 * @returns {string} - The hex-encoded IV and base64-encoded encrypted string (iv:encrypted)
 */
const encrypt = (data) => {
  try {
    if (!data) return data;
    const text = typeof data === 'object' ? JSON.stringify(data) : String(data);

    // Generate a random 16-byte IV for every encryption
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Prepend the IV (in base64) to the ciphertext so it can be extracted later
    return iv.toString('base64') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

/**
 * Decrypts a base64 encoded encrypted string (with optional prepended IV) using AES-256-CBC
 * @param {string} encryptedText - The encrypted string to decrypt
 * @returns {string} - The original text
 */
const decrypt = (encryptedText) => {
  try {
    if (!encryptedText) return encryptedText;

    let iv;
    let encryptedData;

    // Check if the ciphertext has a dynamic IV prepended (iv:ciphertext)
    if (encryptedText.includes(':')) {
      const textParts = encryptedText.split(':');
      iv = Buffer.from(textParts.shift(), 'base64');
      encryptedData = textParts.join(':');
    }

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
};

module.exports = {
  encrypt,
  decrypt
};
