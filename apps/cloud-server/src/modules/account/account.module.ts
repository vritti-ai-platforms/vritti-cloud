import { MediaDomainModule } from '@domain/media/media.module';
import { MfaModule } from '@domain/mfa/mfa.module';
import { OAuthDomainModule } from '@domain/oauth/oauth.module';
import { SessionModule } from '@domain/session/session.module';
import { UserDomainModule } from '@domain/user/user.module';
import { VerificationModule } from '@domain/verification/verification.module';
import { Module } from '@nestjs/common';
import { ProfileController } from './profile/controllers/profile.controller';
import { ProfileService } from './profile/services/profile.service';
import { SecurityController } from './security/controllers/security.controller';
import { SecurityService } from './security/services/security.service';

@Module({
  imports: [UserDomainModule, SessionModule, VerificationModule, MediaDomainModule, MfaModule, OAuthDomainModule],
  controllers: [ProfileController, SecurityController],
  providers: [ProfileService, SecurityService],
})
export class AccountModule {}
