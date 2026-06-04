import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePlanAppDto {
  @ApiPropertyOptional({
    description: 'Feature codes included in this plan for the app — set to null to include all features',
    type: [String],
    example: ['contacts.view', 'contacts.edit'],
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includedFeatureCodes?: string[] | null;

  @ApiPropertyOptional({ description: 'Display order within the plan', example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
