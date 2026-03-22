import { ApiProperty } from '@nestjs/swagger';

export class AppFeatureTableRowDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  featureId: string;

  @ApiProperty({ example: 'orders.dine-in.create' })
  code: string;

  @ApiProperty({ example: 'Create Dine-In Order' })
  name: string;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  // Maps a raw join row to an AppFeatureTableRowDto
  static from(row: {
    featureId: string;
    code: string;
    name: string;
    sortOrder: number;
  }): AppFeatureTableRowDto {
    const dto = new AppFeatureTableRowDto();
    dto.featureId = row.featureId;
    dto.code = row.code;
    dto.name = row.name;
    dto.sortOrder = row.sortOrder;
    return dto;
  }
}
