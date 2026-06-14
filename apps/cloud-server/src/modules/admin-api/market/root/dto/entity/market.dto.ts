import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Market } from '@/db/schema';

export class MarketDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'in' })
  code: string;

  @ApiProperty({ example: 'India' })
  name: string;

  @ApiProperty({ example: 'INR' })
  currencyCode: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', nullable: true })
  updatedAt: Date | null;

  @ApiProperty({ example: 3 })
  countryCount: number;

  @ApiProperty({ example: true })
  canDelete: boolean;

  // Creates a MarketDto from a market entity
  static from(market: Market, countryCount = 0, canDelete = true): MarketDto {
    const dto = new MarketDto();
    dto.id = market.id;
    dto.code = market.code;
    dto.name = market.name;
    dto.currencyCode = market.currencyCode;
    dto.isActive = market.isActive ?? true;
    dto.createdAt = market.createdAt;
    dto.updatedAt = market.updatedAt;
    dto.countryCount = countryCount;
    dto.canDelete = canDelete;
    return dto;
  }
}
