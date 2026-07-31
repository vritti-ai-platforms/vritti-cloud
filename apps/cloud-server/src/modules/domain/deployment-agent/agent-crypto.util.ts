import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createPrivateKey,
  createPublicKey,
  randomBytes,
  sign,
  verify,
} from 'node:crypto';

// Fixed 12-byte SPKI DER prefix that precedes a 32-byte raw Ed25519 public key
const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');
const RAW_ED25519_PUBLIC_KEY_SIZE = 32;

// Converts a base64 SPKI-DER Ed25519 public key (api-sdk key format) to the raw 32-byte key, base64-std — the agent's deploymentPubKey wire format
export function spkiToRawEd25519PubB64(spkiDerBase64: string): string {
  const der = Buffer.from(spkiDerBase64, 'base64');
  return der.subarray(der.length - RAW_ED25519_PUBLIC_KEY_SIZE).toString('base64');
}

// Signs a message with a base64 pkcs8-DER Ed25519 private key, returning a base64-std detached signature (matches Go ed25519.Sign)
export function signEd25519B64(pkcs8DerBase64: string, message: string | Buffer): string {
  const key = createPrivateKey({ key: Buffer.from(pkcs8DerBase64, 'base64'), format: 'der', type: 'pkcs8' });
  const msg = typeof message === 'string' ? Buffer.from(message, 'utf8') : message;
  return sign(null, msg, key).toString('base64');
}

// Verifies a base64-std detached signature over a message against a raw 32-byte Ed25519 public key (base64-std); malformed input ⇒ false
export function verifyEd25519RawPubB64(
  rawPubBase64: string,
  message: string | Buffer,
  signatureBase64: string,
): boolean {
  try {
    const rawPub = Buffer.from(rawPubBase64, 'base64');
    if (rawPub.length !== RAW_ED25519_PUBLIC_KEY_SIZE) return false;
    const der = Buffer.concat([ED25519_SPKI_PREFIX, rawPub]);
    const key = createPublicKey({ key: der, format: 'der', type: 'spki' });
    const msg = typeof message === 'string' ? Buffer.from(message, 'utf8') : message;
    return verify(null, msg, key, Buffer.from(signatureBase64, 'base64'));
  } catch {
    return false;
  }
}

// Generates a URL-safe random credential/token (used for the bearer credential and one-time enroll token)
export function generateOpaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

// Derives a 32-byte AES key from an arbitrary secret string
function deriveAesKey(secret: string): Buffer {
  return createHash('sha256').update(secret, 'utf8').digest();
}

// Encrypts an operator secret at rest with AES-256-GCM; returns base64(iv || authTag || ciphertext)
export function encryptSecretAtRest(plaintext: string, secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', deriveAesKey(secret), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString('base64');
}

// Decrypts a secret produced by encryptSecretAtRest
export function decryptSecretAtRest(encrypted: string, secret: string): string {
  const raw = Buffer.from(encrypted, 'base64');
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', deriveAesKey(secret), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

// Seals a plaintext to the agent's X25519 sealing public key using libsodium crypto_box_seal (anonymous box)
//
// TODO(agent-secrets): implement with libsodium-wrappers or tweetnacl-sealedbox-box. crypto_box_seal derives its
// nonce as blake2b-192(ephemeralPub || recipientPub), which neither Node's crypto (blake2b512 only) nor tweetnacl
// (SHA-512) can produce, so a correct anonymous box cannot be built from the currently available deps. Until a
// libsodium-compatible dep is added, operator secrets are stored encrypted-at-rest but NOT surfaced in
// desiredState.sealedSecrets — apw1 MVP has no operator secrets, so this path is unexercised.
export function sealToAgentX25519(_plaintext: string, _sealingPubKeyBase64: string): string {
  throw new Error(
    'sealToAgentX25519 not implemented: add libsodium-wrappers (crypto_box_seal) before enabling sealed operator secrets',
  );
}
