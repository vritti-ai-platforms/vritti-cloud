import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PlanApp } from '@/db/schema';

export class PlanAppDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  planId: string;

  @ApiProperty({ example: 'crm' })
  appCode: string;

  @ApiPropertyOptional({ type: [String], nullable: true, example: ['contacts.view', 'contacts.edit'] })
  includedFeatureCodes: string[] | null;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  // Creates a PlanAppDto from a plan-app row
  static from(planApp: PlanApp): PlanAppDto {
    const dto = new PlanAppDto();
    dto.id = planApp.id;
    dto.planId = planApp.planId;
    dto.appCode = planApp.appCode;
    dto.includedFeatureCodes = planApp.includedFeatureCodes;
    dto.sortOrder = planApp.sortOrder;
    return dto;
  }
}
