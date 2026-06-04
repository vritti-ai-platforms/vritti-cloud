import { Module } from '@nestjs/common';
import { BusinessDomainModule } from '@domain/business/business.module';
import { BusinessController } from './root/controllers/business.controller';

@Module({
  imports: [BusinessDomainModule],
  controllers: [BusinessController],
})
export class AdminBusinessModule {}
