import { Module } from '@nestjs/common';
import { AppVersionDomainModule } from '@domain/app-version/app-version.module';
import { IndustryAppRepository } from './repositories/industry-app.repository';
import { IndustryRepository } from './repositories/industry.repository';
import { IndustryAppService } from './services/industry-app.service';
import { IndustryService } from './services/industry.service';

@Module({
  imports: [AppVersionDomainModule],
  providers: [IndustryService, IndustryRepository, IndustryAppService, IndustryAppRepository],
  exports: [IndustryService, IndustryRepository, IndustryAppService, IndustryAppRepository],
})
export class IndustryDomainModule {}
