import { SessionModule } from '@domain/session/session.module';
import { UserDomainModule } from '@domain/user/user.module';
import { VerificationModule } from '@domain/verification/verification.module';
import { Module } from '@nestjs/common';
import { ProfileController } from './profile/controllers/profile.controller';
import { ProfileService } from './profile/services/profile.service';

@Module({
  imports: [UserDomainModule, SessionModule, VerificationModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class AccountModule {}
