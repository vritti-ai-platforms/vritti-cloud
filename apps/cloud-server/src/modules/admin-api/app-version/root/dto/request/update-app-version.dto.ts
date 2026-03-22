import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateAppVersionDto {
  @ApiPropertyOptional({ description: 'Semver version string', example: '1.0.0' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Matches(/^[0-9]+\.[0-9]+\.[0-9]+/, { message: 'Must be semver format (e.g. 1.0.0)' })
  version?: string;

  @ApiPropertyOptional({ description: 'Display name', example: 'Restaurant Suite v1' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;
}
