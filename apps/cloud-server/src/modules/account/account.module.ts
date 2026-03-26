import { SessionModule } from '@domain/session/session.module';
import { UserDomainModule } from '@domain/user/user.module';
import { Module } from '@nestjs/common';
import { ContactChangeController } from './controllers/email-phone-change.controller';
import { ProfileController } from './controllers/profile.controller';

@Module({
  imports: [UserDomainModule, SessionModule],
  controllers: [ContactChangeController, ProfileController],
})
export class AccountModule {}
