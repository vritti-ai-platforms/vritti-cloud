import { Module } from '@nestjs/common';
import { UserDomainRepository } from './repositories/user.repository';
import { UserDomainService } from './services/user.service';

@Module({
  providers: [UserDomainService, UserDomainRepository],
  exports: [UserDomainService, UserDomainRepository],
})
export class UserDomainModule {}
