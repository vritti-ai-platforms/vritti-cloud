import { Module } from '@nestjs/common';
import { VerificationModule } from '@domain/verification/verification.module';
import { UserRepository } from './repositories/user.repository';
import { EmailChangeService } from './services/email-change.service';
import { PhoneChangeService } from './services/phone-change.service';
import { UserService } from './services/user.service';

@Module({
  imports: [VerificationModule],
  providers: [UserService, UserRepository, EmailChangeService, PhoneChangeService],
  exports: [UserService, UserRepository, EmailChangeService, PhoneChangeService],
})
export class UserDomainModule {}
