import { createPrivateKey, createPublicKey, randomBytes, sign, verify } from 'node:crypto';
import sodium from 'libsodium-wrappers';

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

// Seals a plaintext to the agent's raw 32-byte X25519 sealing public key (base64) via libsodium crypto_box_seal
// Output = base64-std( ephemeralPub(32) || box ), nonce = blake2b(ephemeralPub||recipientPub) — the Go agent opens it with nacl/box.OpenAnonymous
export async function sealToAgent(plaintext: string, agentSealingPubKeyB64: string): Promise<string> {
  await sodium.ready;
  const recipientPub = sodium.from_base64(agentSealingPubKeyB64, sodium.base64_variants.ORIGINAL);
  const sealed = sodium.crypto_box_seal(Buffer.from(plaintext, 'utf8'), recipientPub);
  return sodium.to_base64(sealed, sodium.base64_variants.ORIGINAL);
}
