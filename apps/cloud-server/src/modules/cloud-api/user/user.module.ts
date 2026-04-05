import { Module } from '@nestjs/common';
import { UserDomainModule } from '@domain/user/user.module';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [UserDomainModule],
  controllers: [UserController],
  exports: [UserDomainModule],
})
export class UserModule {}
