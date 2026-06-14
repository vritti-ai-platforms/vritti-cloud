import { Module } from '@nestjs/common';
import { MfaRepository } from './repositories/mfa.repository';
import { BackupCodeService } from './services/backup-code.service';
import { TotpService } from './services/totp.service';
import { WebAuthnService } from './services/webauthn.service';

@Module({
  providers: [TotpService, WebAuthnService, BackupCodeService, MfaRepository],
  exports: [TotpService, WebAuthnService, BackupCodeService, MfaRepository],
})
export class MfaModule {}
