import { Module } from '@nestjs/common';
import { PriceDomainModule } from '@domain/price/price.module';
import { PriceController } from './controllers/price.controller';

@Module({
  imports: [PriceDomainModule],
  controllers: [PriceController],
})
export class AdminPriceModule {}
