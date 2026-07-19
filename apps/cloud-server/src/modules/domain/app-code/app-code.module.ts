import { Module } from '@nestjs/common';
import { AppCodeDomainRepository } from './repositories/app-code.repository';
import { AppCodeDomainService } from './services/app-code.service';

@Module({
  providers: [AppCodeDomainService, AppCodeDomainRepository],
  exports: [AppCodeDomainService],
})
export class AppCodeDomainModule {}
