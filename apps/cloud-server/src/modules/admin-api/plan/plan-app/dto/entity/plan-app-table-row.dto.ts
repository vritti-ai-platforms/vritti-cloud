import { ApiProperty } from '@nestjs/swagger';

export class PlanAppTableRowDto {
  @ApiProperty({ example: 'crm' })
  appCode: string;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  // Maps a raw row to a PlanAppTableRowDto
  static from(row: { appCode: string; sortOrder: number }): PlanAppTableRowDto {
    const dto = new PlanAppTableRowDto();
    dto.appCode = row.appCode;
    dto.sortOrder = row.sortOrder;
    return dto;
  }
}
