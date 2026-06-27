import { ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({ description: 'Permission code (lowercase snake_case)', example: 'add_salt' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Matches(/^[a-z][a-z0-9_]*$/, { message: 'Code must be lowercase snake_case (e.g. "add_salt")' })
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
