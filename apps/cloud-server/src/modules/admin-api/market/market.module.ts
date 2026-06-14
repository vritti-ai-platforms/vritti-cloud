import { MarketDomainModule } from '@domain/market/market.module';
import { Module } from '@nestjs/common';
import { MarketCountryController } from './market-country/controllers/market-country.controller';
import { MarketController } from './root/controllers/market.controller';

@Module({
  imports: [MarketDomainModule],
  controllers: [MarketController, MarketCountryController],
})
export class AdminMarketModule {}
