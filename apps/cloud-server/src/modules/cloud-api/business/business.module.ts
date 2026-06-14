import { BusinessDomainModule } from '@domain/business/business.module';
import { Module } from '@nestjs/common';
import { BusinessController } from './controllers/business.controller';

@Module({
  imports: [BusinessDomainModule],
  controllers: [BusinessController],
})
export class BusinessModule {}
