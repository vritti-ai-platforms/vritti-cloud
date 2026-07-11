import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SiteGroupDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: 'uuid-here' })
  organizationId: string;

  @ApiProperty({ example: 'South Zone' })
  name: string;

  @ApiProperty({ example: 'south-zone' })
  code: string;

  @ApiPropertyOptional({ example: 'uuid-here', nullable: true })
  parentId: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: string;
}
