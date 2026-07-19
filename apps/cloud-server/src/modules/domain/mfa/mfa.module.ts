import { Module } from '@nestjs/common';
import { MfaDomainRepository } from './repositories/mfa.repository';
import { BackupCodeDomainService } from './services/backup-code.service';
import { TotpDomainService } from './services/totp.service';
import { WebAuthnDomainService } from './services/webauthn.service';

@Module({
  providers: [TotpDomainService, WebAuthnDomainService, BackupCodeDomainService, MfaDomainRepository],
  exports: [TotpDomainService, WebAuthnDomainService, BackupCodeDomainService, MfaDomainRepository],
})
export class MfaModule {}
