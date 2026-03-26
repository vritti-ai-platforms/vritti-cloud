import { Module } from '@nestjs/common';
import { IndustryRepository } from './repositories/industry.repository';
import { IndustryService } from './services/industry.service';

@Module({
  providers: [IndustryService, IndustryRepository],
  exports: [IndustryService, IndustryRepository],
})
export class IndustryDomainModule {}
