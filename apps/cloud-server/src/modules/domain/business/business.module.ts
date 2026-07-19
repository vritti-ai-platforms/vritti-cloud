import { Module } from '@nestjs/common';
import { BusinessDomainRepository } from './repositories/business.repository';
import { BusinessDomainService } from './services/business.service';

@Module({
  providers: [BusinessDomainService, BusinessDomainRepository],
  exports: [BusinessDomainService, BusinessDomainRepository],
})
export class BusinessDomainModule {}
