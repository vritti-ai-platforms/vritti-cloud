import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiProperty({ description: 'Permission code (lowercase snake_case)', example: 'add_salt' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Matches(/^[a-z][a-z0-9_]*$/, { message: 'Code must be lowercase snake_case (e.g. "add_salt")' })
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

  @ApiPropertyOptional({ description: 'Sort order for display', example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
