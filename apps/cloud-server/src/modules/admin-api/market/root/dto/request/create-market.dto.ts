import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class CreateMarketDto {
  @ApiProperty({ description: 'Unique code identifier for the market', example: 'in' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  code: string;

  @ApiProperty({ description: 'Display name of the market', example: 'India' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'ISO 4217 currency code', example: 'INR' })
  @IsString()
  @Length(3, 3)
  currencyCode: string;

  @ApiPropertyOptional({ description: 'Whether the market is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
