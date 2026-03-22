import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsUUID } from 'class-validator';

export class AssignIndustryAppDto {
  @ApiProperty({ description: 'App UUID to assign to this industry', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  appId: string;

  @ApiPropertyOptional({ description: 'Whether this app is recommended for the industry', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isRecommended?: boolean;

  @ApiPropertyOptional({ description: 'Display order within the industry', example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
