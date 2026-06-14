import { Module } from '@nestjs/common';
import { CountryRepository } from './repositories/country.repository';
import { CountryService } from './services/country.service';

@Module({
  providers: [CountryService, CountryRepository],
  exports: [CountryService, CountryRepository],
})
export class CountryDomainModule {}
