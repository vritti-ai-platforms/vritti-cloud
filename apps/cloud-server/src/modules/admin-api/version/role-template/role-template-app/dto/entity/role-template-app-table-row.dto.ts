import { ApiProperty } from '@nestjs/swagger';

export class RoleTemplateAppTableRowDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  appId: string;

  @ApiProperty({ example: 'pos' })
  code: string;

  @ApiProperty({ example: 'Point of Sale' })
  name: string;

  @ApiProperty({ example: 'shopping-cart' })
  icon: string;

  @ApiProperty({ example: true })
  isAssigned: boolean;

  // Maps a raw row to a RoleTemplateAppTableRowDto
  static from(row: { appId: string; code: string; name: string; icon: string; isAssigned: boolean }): RoleTemplateAppTableRowDto {
    const dto = new RoleTemplateAppTableRowDto();
    dto.appId = row.appId;
    dto.code = row.code;
    dto.name = row.name;
    dto.icon = row.icon;
    dto.isAssigned = row.isAssigned;
    return dto;
  }
}
