import { Global, Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { GeoipService } from './geoip.service';
import { SmsService } from './sms.service';
import { WhatsAppService } from './whatsapp.service';

// Provides cloud-server-specific services for encryption, SMS, WhatsApp, and GeoIP
@Global()
@Module({
  providers: [EncryptionService, GeoipService, SmsService, WhatsAppService],
  exports: [EncryptionService, GeoipService, SmsService, WhatsAppService],
})
export class ServicesModule {}
