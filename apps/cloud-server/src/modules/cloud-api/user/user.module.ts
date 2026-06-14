import { UserDomainModule } from '@domain/user/user.module';
import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [UserDomainModule],
  controllers: [UserController],
  exports: [UserDomainModule],
})
export class UserModule {}
