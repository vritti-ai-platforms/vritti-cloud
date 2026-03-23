import { Module } from '@nestjs/common';
import { SessionModule } from '@domain/session/session.module';
import { UserDomainModule } from '@domain/user/user.module';
import { VerificationModule } from '@domain/verification/verification.module';
import { ContactChangeController } from './controllers/contact-change.controller';
import { UserController } from './controllers/user.controller';
import { ChangeRequestRateLimitRepository } from './repositories/change-request-rate-limit.repository';
import { EmailChangeRequestRepository } from './repositories/email-change-request.repository';
import { PhoneChangeRequestRepository } from './repositories/phone-change-request.repository';
import { EmailChangeService } from './services/email-change.service';
import { PhoneChangeService } from './services/phone-change.service';
import { RateLimitService } from './services/rate-limit.service';

@Module({
  imports: [UserDomainModule, SessionModule, VerificationModule],
  controllers: [UserController, ContactChangeController],
  providers: [
    EmailChangeService,
    PhoneChangeService,
    RateLimitService,
    EmailChangeRequestRepository,
    PhoneChangeRequestRepository,
    ChangeRequestRateLimitRepository,
  ],
  exports: [UserDomainModule],
})
export class UserModule {}
