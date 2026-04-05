import { Module } from '@nestjs/common';
import { IndustryDomainModule } from '@domain/industry/industry.module';
import { IndustryController } from './root/controllers/industry.controller';

@Module({
  imports: [IndustryDomainModule],
  controllers: [IndustryController],
})
export class AdminIndustryModule {}
