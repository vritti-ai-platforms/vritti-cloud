import * as crypto from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly whatsappClient: AxiosInstance;
  private readonly phoneNumberId: string;
  private readonly accessToken: string;
  private readonly appSecret: string;
  private readonly apiVersion: string;

  constructor(private readonly configService: ConfigService) {
    this.phoneNumberId = this.configService.getOrThrow<string>('WHATSAPP_PHONE_NUMBER_ID');
    this.accessToken = this.configService.getOrThrow<string>('WHATSAPP_ACCESS_TOKEN');
    this.appSecret = this.configService.getOrThrow<string>('META_CLIENT_SECRET');
    this.apiVersion = this.configService.getOrThrow<string>('WHATSAPP_API_VERSION');

    // Initialize WhatsApp Cloud API client
    this.whatsappClient = axios.create({
      baseURL: `https://graph.facebook.com/${this.apiVersion}`,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds
    });
  }

  // Sends a verification message via WhatsApp and returns the message ID
  async sendVerificationMessage(toPhone: string, verificationToken: string): Promise<string> {
    try {
      // Remove + prefix for WhatsApp API
      const formattedPhone = toPhone.startsWith('+') ? toPhone.substring(1) : toPhone;

      // For now, send as text message (production should use approved message templates)
      const payload = {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: {
          body: `Your Vritti verification code is: ${verificationToken}\n\nReply with this code to verify your phone number.\n\nThis code expires in 10 minutes.`,
        },
      };

      this.logger.log(`Sending WhatsApp verification to ${formattedPhone} with token ${verificationToken}`);

      const response = await this.whatsappClient.post(`/${this.phoneNumberId}/messages`, payload);

      const messageId = response.data.messages?.[0]?.id;
      this.logger.log(`WhatsApp message sent successfully. Message ID: ${messageId}`);

      return messageId;
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message: ${error.message}`, error.stack);
      throw new Error(`Failed to send WhatsApp verification: ${error.message}`);
    }
  }

  // Sends a verification message using a pre-approved Meta template and returns the message ID
  async sendVerificationTemplate(
    toPhone: string,
    verificationToken: string,
    templateName: string = 'verification_code',
  ): Promise<string> {
    try {
      const formattedPhone = toPhone.startsWith('+') ? toPhone.substring(1) : toPhone;

      const payload = {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'en_US',
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: verificationToken,
                },
              ],
            },
          ],
        },
      };

      this.logger.log(`Sending WhatsApp template ${templateName} to ${formattedPhone}`);

      const response = await this.whatsappClient.post(`/${this.phoneNumberId}/messages`, payload);

      const messageId = response.data.messages?.[0]?.id;
      this.logger.log(`WhatsApp template message sent successfully. Message ID: ${messageId}`);

      return messageId;
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp template: ${error.message}`, error.stack);

      // Fallback to text message if template fails
      this.logger.warn('Falling back to text message');
      return this.sendVerificationMessage(toPhone, verificationToken);
    }
  }

  // Validates a WhatsApp webhook signature via HMAC-SHA256
  validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      if (!signature) {
        this.logger.warn('No signature provided in webhook request');
        return false;
      }

      this.logger.debug(`Validating webhook signature: ${signature}`);

      // Signature format: "sha256=<hash>"
      const parts = signature.split('=');
      if (parts.length !== 2 || parts[0] !== 'sha256') {
        this.logger.warn(`Invalid signature format: ${signature}`);
        return false;
      }

      const expectedSignature = parts[1];

      // Compute HMAC-SHA256 hash
      const hmac = crypto.createHmac('sha256', this.appSecret);
      hmac.update(payload, 'utf8');
      const computedSignature = hmac.digest('hex');

      // Use timing-safe comparison to prevent timing attacks
      const isValid = crypto.timingSafeEqual(
        Buffer.from(computedSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex'),
      );

      if (!isValid) {
        this.logger.warn('Webhook signature validation failed');
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Error validating webhook signature: ${error.message}`, error.stack);
      return false;
    }
  }

  // Normalizes a phone number to E.164 format with + prefix
  normalizePhoneNumber(phone: string): string {
    return phone.startsWith('+') ? phone : `+${phone}`;
  }

  // Extracts the ISO country code from a phone number (best guess)
  extractCountryCode(phone: string): string {
    // Remove + prefix
    const normalized = phone.startsWith('+') ? phone.substring(1) : phone;

    // Simple country code extraction (first 1-3 digits); use libphonenumber-js in production
    const countryCodeMap: Record<string, string> = {
      '1': 'US', // USA/Canada
      '91': 'IN', // India
      '44': 'GB', // UK
      '33': 'FR', // France
      '49': 'DE', // Germany
      '39': 'IT', // Italy
      '34': 'ES', // Spain
      '7': 'RU', // Russia
      '86': 'CN', // China
      '81': 'JP', // Japan
      '82': 'KR', // South Korea
      '55': 'BR', // Brazil
      '61': 'AU', // Australia
      '27': 'ZA', // South Africa
    };

    // Try matching 2-digit codes first, then 1-digit
    for (let i = 3; i >= 1; i--) {
      const prefix = normalized.substring(0, i);
      if (countryCodeMap[prefix]) {
        return countryCodeMap[prefix];
      }
    }

    // Default to Unknown
    this.logger.warn(`Could not determine country code for phone: ${phone}`);
    return 'UN'; // Unknown
  }
}
