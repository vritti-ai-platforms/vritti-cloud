import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateAppDto {
  @ApiProperty({ description: 'App version UUID this app belongs to', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  versionId: string;

  @ApiProperty({
    description: 'Unique app code (lowercase, alphanumeric with hyphens)',
    example: 'pos',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^[a-z][a-z0-9-]*$/, {
    message: 'Code must start with a lowercase letter and contain only lowercase letters, digits, and hyphens',
  })
  code: string;

  @ApiProperty({ description: 'Display name of the app', example: 'Point of Sale' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Optional description of the app', example: 'Core POS module for order management' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Lucide icon name', example: 'shopping-cart' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  icon: string;

  @ApiPropertyOptional({ description: 'Sort order for display', example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
