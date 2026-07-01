import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateFeaturePermissionDto {
  @ApiPropertyOptional({ description: 'Permission code (dot-separated lowercase)', example: 'add.salt' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @MinLength(1)
  @MaxLength(50)
  @Matches(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/, {
    message: 'Code must be dot-separated lowercase segments (e.g. "add.salt")',
  })
  code?: string;

  @ApiPropertyOptional({ description: 'Human-readable permission label', example: 'Add Salt' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  label?: string;

  @ApiPropertyOptional({ description: 'When true, applies to all businesses', example: false })
  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @ApiPropertyOptional({
    type: [String],
    description: 'Businesses to link when not global (replaces existing links)',
    example: ['550e8400-e29b-41d4-a716-446655440002'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  businessIds?: string[];

  @ApiPropertyOptional({ description: 'Sort order for display', example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
