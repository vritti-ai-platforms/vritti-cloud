import { Module } from '@nestjs/common';
import { PriceRepository } from './repositories/price.repository';
import { PriceService } from './services/price.service';

@Module({
  providers: [PriceService, PriceRepository],
  exports: [PriceService, PriceRepository],
})
export class PriceDomainModule {}
