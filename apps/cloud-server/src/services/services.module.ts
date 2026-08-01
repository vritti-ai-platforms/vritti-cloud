import { Global, Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { GeoipService } from './geoip.service';
import { SmsService } from './sms.service';
import { WhatsAppService } from './whatsapp.service';

// Provides cloud-server-specific services for crypto, SMS, WhatsApp, and GeoIP
@Global()
@Module({
  providers: [CryptoService, GeoipService, SmsService, WhatsAppService],
  exports: [CryptoService, GeoipService, SmsService, WhatsAppService],
})
export class ServicesModule {}
