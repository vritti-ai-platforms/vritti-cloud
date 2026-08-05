import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  createPrivateKey,
  createPublicKey,
  randomBytes,
  sign,
  timingSafeEqual,
  verify,
} from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import sodium from 'libsodium-wrappers';

// Fixed 12-byte SPKI DER prefix that precedes a 32-byte raw Ed25519 public key
const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');
const RAW_ED25519_PUBLIC_KEY_SIZE = 32;

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);

  constructor(private readonly configService: ConfigService) {}

  private get saltRounds(): number {
    return this.configService.getOrThrow<number>('BCRYPT_SALT_ROUNDS');
  }

  // Hashes a password with bcrypt
  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      this.logger.error('Failed to hash password:', error);
      throw new Error('Password hashing failed');
    }
  }

  // Compares a plain text password against a bcrypt hash
  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      this.logger.error('Failed to compare password:', error);
      throw new Error('Password comparison failed');
    }
  }

  // Hashes an arbitrary code with bcrypt — for backup codes or any standalone hashing need
  async hashCode(code: string): Promise<string> {
    return this.hashOtp(code);
  }

  // Generates a random OTP and returns it alongside its bcrypt hash
  async issueOtp(): Promise<{ code: string; hash: string }> {
    const code = this.generateOtp();
    const hash = await this.hashOtp(code);
    return { code, hash };
  }

  // Compares a plain text OTP against a bcrypt hash
  async compareOtp(otp: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(otp, hash);
    } catch (error) {
      this.logger.error('Failed to compare OTP:', error);
      throw new Error('OTP comparison failed');
    }
  }

  // Generates a random hex code and returns it alongside its HMAC digest for DB storage
  issueHexCode(): { code: string; hash: string } {
    const code = this.generateHexCode();
    const hash = this.hmacDigestHexCode(code);
    return { code, hash };
  }

  // Computes HMAC-SHA256 of a token and returns the hex digest for deterministic DB lookup
  hmacDigestHexCode(token: string): string {
    const key = this.configService.getOrThrow<string>('HMAC_KEY');
    return createHmac('sha256', key).update(token).digest('hex');
  }

  // Compares two hex digests in constant time to prevent timing attacks
  compareHexCode(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  }

  // Encrypts a value at rest with AES-256-GCM; returns base64(iv || authTag || ciphertext)
  encrypt(plaintext: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.deriveAesKey(), iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, ciphertext]).toString('base64');
  }

  // Decrypts a value produced by encrypt()
  decrypt(ciphertext: string): string {
    const raw = Buffer.from(ciphertext, 'base64');
    const iv = raw.subarray(0, 12);
    const authTag = raw.subarray(12, 28);
    const encrypted = raw.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', this.deriveAesKey(), iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }

  // Derives a 32-byte AES key from the configured ENCRYPTION_KEY
  private deriveAesKey(): Buffer {
    const secret = this.configService.getOrThrow<string>('ENCRYPTION_KEY');
    return createHash('sha256').update(secret, 'utf8').digest();
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async hashOtp(otp: string): Promise<string> {
    try {
      return await bcrypt.hash(otp, this.saltRounds);
    } catch (error) {
      this.logger.error('Failed to hash OTP:', error);
      throw new Error('OTP hashing failed');
    }
  }

  // Generates a short random hex code for inbound QR verification (e.g., "VER1A2B3C")
  private generateHexCode(): string {
    const hex = randomBytes(3).toString('hex').toUpperCase();
    return `VER${hex}`;
  }

  // ==========================================================================
  // Ed25519 / anonymous-seal primitives (raw byte-level crypto; domain-neutral)
  // ==========================================================================

  // Converts a base64 SPKI-DER Ed25519 public key (api-sdk key format) to the raw 32-byte key, base64-std
  ed25519SpkiToRaw(spkiDerBase64: string): string {
    const der = Buffer.from(spkiDerBase64, 'base64');
    return der.subarray(der.length - RAW_ED25519_PUBLIC_KEY_SIZE).toString('base64');
  }

  // Signs a message with a base64 pkcs8-DER Ed25519 private key, returning a base64-std detached signature (matches Go ed25519.Sign)
  ed25519Sign(pkcs8DerBase64: string, message: string | Buffer): string {
    const key = createPrivateKey({ key: Buffer.from(pkcs8DerBase64, 'base64'), format: 'der', type: 'pkcs8' });
    const msg = typeof message === 'string' ? Buffer.from(message, 'utf8') : message;
    return sign(null, msg, key).toString('base64');
  }

  // Verifies a base64-std detached signature over a message against a raw 32-byte Ed25519 public key (base64-std); malformed input ⇒ false
  ed25519Verify(rawPubBase64: string, message: string | Buffer, signatureBase64: string): boolean {
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

  // Generates a URL-safe random credential/token (used for bearer credentials and one-time tokens)
  generateOpaqueToken(bytes = 32): string {
    return randomBytes(bytes).toString('base64url');
  }

  // Seals a plaintext to a raw 32-byte X25519 public key (base64) via libsodium crypto_box_seal.
  // Output = base64-std( ephemeralPub(32) || box ) — opened with nacl/box.OpenAnonymous on the recipient side.
  async sealAnonymous(plaintext: string, recipientPubKeyB64: string): Promise<string> {
    await sodium.ready;
    const recipientPub = sodium.from_base64(recipientPubKeyB64, sodium.base64_variants.ORIGINAL);
    const sealed = sodium.crypto_box_seal(Buffer.from(plaintext, 'utf8'), recipientPub);
    return sodium.to_base64(sealed, sodium.base64_variants.ORIGINAL);
  }
}
