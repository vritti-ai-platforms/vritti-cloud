import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateFeatureDto {
  @ApiProperty({ description: 'App version UUID this feature belongs to', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  versionId: string;

  @ApiProperty({
    description: 'Dot-separated feature code (lowercase, alphanumeric segments)',
    example: 'orders.dine-in.create',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Matches(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/, {
    message: 'Code must be dot-separated lowercase segments (e.g. "orders.dine-in.create")',
  })
  code: string;

  @ApiProperty({ description: 'Display name of the feature', example: 'Create Dine-In Order' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Optional description of the feature', example: 'Allows creating a new dine-in order' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Icon identifier for the feature', example: 'receipt' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  icon?: string;

  @ApiPropertyOptional({ description: 'Sort order for display', example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
