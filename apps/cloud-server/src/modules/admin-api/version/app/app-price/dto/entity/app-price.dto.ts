import { ApiProperty } from '@nestjs/swagger';
import type { AppPrice } from '@/db/schema';

export class AppPriceDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  appId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  regionId: string;

  @ApiProperty({ example: 'Mumbai' })
  regionName: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  cloudProviderId: string;

  @ApiProperty({ example: 'AWS' })
  providerName: string;

  @ApiProperty({ example: '499.00' })
  monthlyPrice: string;

  @ApiProperty({ example: 'INR' })
  currency: string;

  // Maps an AppPrice entity with joined names to an AppPriceDto
  static from(price: AppPrice, regionName: string, providerName: string): AppPriceDto {
    const dto = new AppPriceDto();
    dto.id = price.id;
    dto.appId = price.appId;
    dto.regionId = price.regionId;
    dto.cloudProviderId = price.cloudProviderId;
    dto.regionName = regionName;
    dto.providerName = providerName;
    dto.monthlyPrice = price.monthlyPrice;
    dto.currency = price.currency;
    return dto;
  }
}
