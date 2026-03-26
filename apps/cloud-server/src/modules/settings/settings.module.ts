import { Module } from '@nestjs/common';
import { SessionModule } from '@domain/session/session.module';
import { UserDomainModule } from '@domain/user/user.module';
import { ContactChangeController } from './controllers/contact-change.controller';
import { ProfileController } from './controllers/profile.controller';

@Module({
  imports: [UserDomainModule, SessionModule],
  controllers: [ContactChangeController, ProfileController],
})
export class SettingsModule {}
