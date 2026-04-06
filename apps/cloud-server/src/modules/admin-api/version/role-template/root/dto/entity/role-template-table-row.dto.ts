import { ApiProperty } from '@nestjs/swagger';
import type { RoleTemplate } from '@/db/schema';
import { RoleTemplateDto } from './role-template.dto';

export class RoleTemplateTableRowDto extends RoleTemplateDto {
  @ApiProperty({ example: 'Restaurant' })
  industryName: string;

  @ApiProperty({ example: 12 })
  permissionCount: number;

  // Maps a joined RoleTemplate row (with industryName + permissionCount) to a table row DTO
  static fromRow(row: RoleTemplate & { industryName: string; permissionCount: number }): RoleTemplateTableRowDto {
    const dto = RoleTemplateDto.from(row) as RoleTemplateTableRowDto;
    dto.industryName = row.industryName;
    dto.permissionCount = row.permissionCount;
    return dto;
  }
}
