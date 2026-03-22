import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class UpdateIndustryAppDto {
  @ApiPropertyOptional({ description: 'Whether this app is recommended for the industry', example: true })
  @IsOptional()
  @IsBoolean()
  isRecommended?: boolean;

  @ApiPropertyOptional({ description: 'Display order within the industry', example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
