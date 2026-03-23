import { Module } from '@nestjs/common';
import { IndustryDomainModule } from '@domain/industry/industry.module';
import { IndustryController } from './root/controllers/industry.controller';
import { IndustryAppController } from './industry-app/controllers/industry-app.controller';

@Module({
  imports: [IndustryDomainModule],
  controllers: [IndustryController, IndustryAppController],
})
export class AdminIndustryModule {}
