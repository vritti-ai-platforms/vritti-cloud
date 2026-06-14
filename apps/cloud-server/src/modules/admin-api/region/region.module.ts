import { RegionDomainModule } from '@domain/region/region.module';
import { Module } from '@nestjs/common';
import { RegionController } from './controllers/region.controller';

@Module({
  imports: [RegionDomainModule],
  controllers: [RegionController],
})
export class AdminRegionModule {}
