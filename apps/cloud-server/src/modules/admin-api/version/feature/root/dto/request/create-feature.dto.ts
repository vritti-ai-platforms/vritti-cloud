import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIconName } from '@vritti/api-sdk/icons';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { type ScopeType, ScopeTypeValues, type SiteApplies, SiteAppliesValues } from '@/db/schema';

export class CreateFeatureDto {
  @ApiProperty({
    description: 'App version UUID this feature belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  versionId: string;

  @ApiProperty({
    description: 'Unique feature code — a single lowercase word (hyphens allowed)',
    example: 'inventory-items',
  })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @MinLength(1)
  @MaxLength(255)
  @Matches(/^[a-z][a-z0-9-]*$/, {
    message: 'Code must be a single lowercase word (letters, numbers, hyphens; e.g. "inventory-items")',
  })
  code: string;

  @ApiProperty({ description: 'Display name of the feature', example: 'Create Dine-In Order' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Optional description of the feature',
    example: 'Allows creating a new dine-in order',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Entity scope the feature operates at (defaults to SITE)',
    enum: ScopeTypeValues,
    example: 'SITE',
  })
  @IsOptional()
  @IsEnum(ScopeTypeValues)
  scope?: ScopeType;

  @ApiPropertyOptional({
    description: 'Site types the feature applies at (defaults to [OUTLET])',
    enum: SiteAppliesValues,
    isArray: true,
    example: ['OUTLET', 'WAREHOUSE'],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(SiteAppliesValues, { each: true })
  applicableSiteTypes?: SiteApplies[];

  @ApiProperty({ description: 'Lucide icon name (web)', example: 'clipboard-list' })
  @IsString()
  @IsIconName('lucide')
  lucideIcon: string;

  @ApiProperty({ description: 'iOS SF Symbol name', example: 'cart.fill' })
  @IsString()
  @IsIconName('sf')
  sfSymbol: string;

  @ApiProperty({ description: 'Android Material Symbol name', example: 'shopping_cart' })
  @IsString()
  @IsIconName('material')
  materialSymbol: string;

  @ApiPropertyOptional({ description: 'Sort order for display', example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
