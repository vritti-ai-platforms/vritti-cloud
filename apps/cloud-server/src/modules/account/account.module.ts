import { MediaDomainModule } from '@domain/media/media.module';
import { SessionModule } from '@domain/session/session.module';
import { UserDomainModule } from '@domain/user/user.module';
import { VerificationModule } from '@domain/verification/verification.module';
import { Module } from '@nestjs/common';
import { ProfileController } from './profile/controllers/profile.controller';
import { ProfileService } from './profile/services/profile.service';
import { SecurityController } from './security/controllers/security.controller';
import { SecurityService } from './security/services/security.service';

@Module({
  imports: [UserDomainModule, SessionModule, VerificationModule, MediaDomainModule],
  controllers: [ProfileController, SecurityController],
  providers: [ProfileService, SecurityService],
})
export class AccountModule {}
