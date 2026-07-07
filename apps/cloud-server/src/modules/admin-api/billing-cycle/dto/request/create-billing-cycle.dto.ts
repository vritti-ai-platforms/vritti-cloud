import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateBillingCycleDto {
  @ApiProperty({ description: 'Display name of the billing cycle', example: 'Monthly' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Number of days in the billing cycle', example: 30 })
  @IsInt()
  @Min(1)
  days: number;

  @ApiPropertyOptional({ description: 'Sort order for display', example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Whether the billing cycle is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
