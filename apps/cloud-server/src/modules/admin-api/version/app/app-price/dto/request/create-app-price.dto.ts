import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAppPriceDto {
  @ApiProperty({ description: 'Region UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  regionId: string;

  @ApiProperty({ description: 'Cloud provider UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  cloudProviderId: string;

  @ApiProperty({ description: 'Monthly addon price', example: 499.0 })
  @IsNumber()
  monthlyPrice: number;

  @ApiPropertyOptional({ description: 'ISO 4217 currency code', example: 'INR' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;
}
