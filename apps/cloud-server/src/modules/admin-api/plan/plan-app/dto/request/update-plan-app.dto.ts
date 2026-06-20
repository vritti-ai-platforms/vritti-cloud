import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class UpdatePlanAppDto {
  @ApiPropertyOptional({ description: 'Display order within the plan', example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
