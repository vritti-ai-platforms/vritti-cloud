import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsCode } from '@vritti/api-sdk/decorators';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class UpdateFeaturePermissionDto {
  @ApiPropertyOptional({ description: 'Permission code (dot-separated lowercase)', example: 'add.salt' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @MinLength(1)
  @MaxLength(50)
  @IsCode({ dotted: true })
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

  @ApiPropertyOptional({
    type: [String],
    description: 'Prerequisite sibling permission ids required before this one (replaces existing edges)',
    example: ['550e8400-e29b-41d4-a716-446655440003'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  dependsOn?: string[];

  @ApiPropertyOptional({ description: 'Sort order for display', example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
