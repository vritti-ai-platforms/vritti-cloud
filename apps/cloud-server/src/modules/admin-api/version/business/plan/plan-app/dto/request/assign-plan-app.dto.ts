import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AssignPlanAppDto {
  @ApiProperty({ description: 'App code to assign to this plan', example: 'crm' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  appCode: string;

  @ApiPropertyOptional({ description: 'Display order within the plan', example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
