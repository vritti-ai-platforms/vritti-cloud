import { ApiProperty } from '@nestjs/swagger';

export class AppFeatureTableRowDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  featureId: string;

  @ApiProperty({ example: 'orders.dine-in.create' })
  code: string;

  @ApiProperty({ example: 'Create Dine-In Order' })
  name: string;

  @ApiProperty({ example: 'clipboard-list' })
  icon: string;

  @ApiProperty({ example: true })
  isAssigned: boolean;

  // Maps a raw join row to an AppFeatureTableRowDto
  static from(row: {
    featureId: string;
    code: string;
    name: string;
    icon: string;
    isAssigned: boolean;
  }): AppFeatureTableRowDto {
    const dto = new AppFeatureTableRowDto();
    dto.featureId = row.featureId;
    dto.code = row.code;
    dto.name = row.name;
    dto.icon = row.icon;
    dto.isAssigned = row.isAssigned;
    return dto;
  }
}
