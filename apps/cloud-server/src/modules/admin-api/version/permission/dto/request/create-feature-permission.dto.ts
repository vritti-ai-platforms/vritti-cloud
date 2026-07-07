import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateFeaturePermissionDto {
  @ApiProperty({ description: 'Feature this permission belongs to', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  featureId: string;

  @ApiProperty({ description: 'Permission code (dot-separated lowercase)', example: 'add.salt' })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @MinLength(1)
  @MaxLength(50)
  @Matches(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/, {
    message: 'Code must be dot-separated lowercase segments (e.g. "add.salt")',
  })
  code: string;

  @ApiProperty({ description: 'Human-readable permission label', example: 'Add Salt' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  label: string;

  @ApiProperty({ description: 'When true, applies to all businesses', example: false })
  @IsBoolean()
  isGlobal: boolean;

  @ApiProperty({
    type: [String],
    description: 'Businesses to link when not global (ignored when isGlobal=true)',
    example: ['550e8400-e29b-41d4-a716-446655440002'],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  businessIds: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Prerequisite sibling permission ids required before this one',
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
