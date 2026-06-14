import { CountryDomainModule } from '@domain/country/country.module';
import { Module } from '@nestjs/common';
import { CountryController } from './controllers/country.controller';

@Module({
  imports: [CountryDomainModule],
  controllers: [CountryController],
})
export class AdminCountryModule {}
