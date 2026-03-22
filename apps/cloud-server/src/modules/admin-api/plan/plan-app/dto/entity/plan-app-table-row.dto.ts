import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlanAppTableRowDto {
  @ApiProperty({ example: 'crm' })
  appCode: string;

  @ApiPropertyOptional({ type: [String], nullable: true, example: ['contacts.view', 'contacts.edit'] })
  includedFeatureCodes: string[] | null;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  // Maps a raw row to a PlanAppTableRowDto
  static from(row: {
    appCode: string;
    includedFeatureCodes: string[] | null;
    sortOrder: number;
  }): PlanAppTableRowDto {
    const dto = new PlanAppTableRowDto();
    dto.appCode = row.appCode;
    dto.includedFeatureCodes = row.includedFeatureCodes;
    dto.sortOrder = row.sortOrder;
    return dto;
  }
}
