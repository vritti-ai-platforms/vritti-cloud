import { Module } from '@nestjs/common';
import { MarketRepository } from './repositories/market.repository';
import { MarketCountryRepository } from './repositories/market-country.repository';
import { MarketService } from './services/market.service';
import { MarketCountryService } from './services/market-country.service';

@Module({
  providers: [MarketService, MarketRepository, MarketCountryService, MarketCountryRepository],
  exports: [MarketService, MarketCountryService, MarketRepository, MarketCountryRepository],
})
export class MarketDomainModule {}
