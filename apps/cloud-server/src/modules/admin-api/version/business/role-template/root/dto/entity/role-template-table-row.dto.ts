import { ApiProperty } from '@nestjs/swagger';
import type { RoleTemplate } from '@/db/schema';
import { RoleTemplateDto } from './role-template.dto';

export class RoleTemplateTableRowDto extends RoleTemplateDto {
  @ApiProperty({ example: 'Restaurant' })
  businessName: string;

  @ApiProperty({ example: 12 })
  permissionCount: number;

  // Maps a joined RoleTemplate row (with businessName + permissionCount) to a table row DTO
  static fromRow(row: RoleTemplate & { businessName: string; permissionCount: number }): RoleTemplateTableRowDto {
    const dto = RoleTemplateDto.from(row) as RoleTemplateTableRowDto;
    dto.businessName = row.businessName;
    dto.permissionCount = row.permissionCount;
    return dto;
  }
}
