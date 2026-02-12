import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.MASTER_KEY; // 32 bytes hex
const IV_LENGTH = 16;

// Generate RSA key pair
export function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
}

// Encrypt private key for storage
export function encryptPrivateKey(privateKey) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

// Decrypt private key for signing
export function decryptPrivateKey(encryptedData) {
  const [ivHex, authTagHex, encryptedHex] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Sign a hash with a private key (PEM)
export function signHash(hash, privateKeyPem) {
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(hash);
  sign.end();
  return sign.sign(privateKeyPem, 'base64');
}

// Verify signature with public key
export function verifySignature(hash, signature, publicKeyPem) {
  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(hash);
  verify.end();
  return verify.verify(publicKeyPem, signature, 'base64');
}