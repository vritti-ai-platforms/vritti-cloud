import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBusinessDto {
  @ApiProperty({ description: 'Display name of the business', example: 'Healthcare' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Unique code identifier for the business', example: 'healthcare' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  code: string;

  @ApiPropertyOptional({ description: 'Optional description of the business', example: 'Healthcare and medical services' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String], example: ['order-management'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendedApps?: string[];
}
