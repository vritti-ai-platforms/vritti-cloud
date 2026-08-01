import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

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
}
