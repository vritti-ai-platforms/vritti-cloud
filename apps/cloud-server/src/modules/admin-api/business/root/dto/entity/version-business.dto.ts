import type { VersionBusinessRow } from '@domain/version/business/root/repositories/version-business.repository';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VersionBusinessDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Pharmacy' })
  name: string;

  @ApiProperty({ example: 'pharmacy' })
  code: string;

  @ApiPropertyOptional({ example: 'Pharmacy and medical retail', nullable: true })
  description: string | null;

  @ApiProperty({ example: 4, description: 'Number of apps defined for this business in the version' })
  appCount: number;

  // Maps an assigned business with app count to a VersionBusinessDto
  static from(row: VersionBusinessRow): VersionBusinessDto {
    const dto = new VersionBusinessDto();
    dto.id = row.id;
    dto.name = row.name;
    dto.code = row.code;
    dto.description = row.description;
    dto.appCount = row.appCount;
    return dto;
  }
}
