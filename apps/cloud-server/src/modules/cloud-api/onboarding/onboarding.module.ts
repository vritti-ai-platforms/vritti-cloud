import { Module } from '@nestjs/common';
import { SessionModule } from '@domain/session/session.module';
import { UserDomainModule } from '@domain/user/user.module';
import { MfaModule } from '@domain/mfa/mfa.module';
import { VerificationModule } from '@domain/verification/verification.module';
import { EmailVerificationController } from './email-verification/controllers/email-verification.controller';
import { EmailVerificationService } from './email-verification/services/email-verification.service';
import { MobileVerificationController } from './mobile-verification/controllers/mobile-verification.controller';
import { VerificationWebhookController } from './mobile-verification/controllers/verification-webhook.controller';
import { MobileVerificationService } from './mobile-verification/services/mobile-verification.service';
import { SseConnectionService } from './mobile-verification/services/sse-connection.service';
import { VerificationEventListener } from './mobile-verification/listeners/verification-event.listener';
import { VerificationWebhookService } from './mobile-verification/services/verification-webhook.service';
import { PasskeySetupController } from './passkey/controllers/passkey-setup.controller';
import { PasskeySetupService } from './passkey/services/passkey-setup.service';
import { OnboardingController } from './root/controllers/onboarding.controller';
import { MfaStatusController } from './root/controllers/mfa-status.controller';
import { OnboardingService } from './root/services/onboarding.service';
import { MfaStatusService } from './root/services/mfa-status.service';
import { TotpSetupController } from './totp/controllers/totp-setup.controller';
import { TotpSetupService } from './totp/services/totp-setup.service';

@Module({
  imports: [
    SessionModule,
    UserDomainModule,
    MfaModule,
    VerificationModule,
  ],
  controllers: [
    OnboardingController,
    EmailVerificationController,
    MobileVerificationController,
    VerificationWebhookController,
    TotpSetupController,
    PasskeySetupController,
    MfaStatusController,
  ],
  providers: [
    // Root
    OnboardingService,
    MfaStatusService,
    // Email verification
    EmailVerificationService,
    // Mobile verification
    MobileVerificationService,
    VerificationWebhookService,
    SseConnectionService,
    VerificationEventListener,
    // TOTP setup
    TotpSetupService,
    // Passkey setup
    PasskeySetupService,
  ],
  exports: [
    OnboardingService,
    EmailVerificationService,
    MobileVerificationService,
  ],
})
export class OnboardingModule {}
