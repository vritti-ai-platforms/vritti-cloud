import { Module } from '@nestjs/common';
import { CountryDomainRepository } from './repositories/country.repository';
import { CountryDomainService } from './services/country.service';

@Module({
  providers: [CountryDomainService, CountryDomainRepository],
  exports: [CountryDomainService, CountryDomainRepository],
})
export class CountryDomainModule {}
