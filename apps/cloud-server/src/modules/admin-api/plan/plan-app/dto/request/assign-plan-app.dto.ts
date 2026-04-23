import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AssignPlanAppDto {
  @ApiProperty({ description: 'App code to assign to this plan', example: 'crm' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  appCode: string;

  @ApiPropertyOptional({
    description: 'Feature codes included in this plan for the app — null means all features',
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
