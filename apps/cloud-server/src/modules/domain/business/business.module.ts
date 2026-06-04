import { Module } from '@nestjs/common';
import { BusinessRepository } from './repositories/business.repository';
import { BusinessService } from './services/business.service';

@Module({
  providers: [BusinessService, BusinessRepository],
  exports: [BusinessService, BusinessRepository],
})
export class BusinessDomainModule {}
