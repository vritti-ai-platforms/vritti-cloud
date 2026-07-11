import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SiteAppliesValues } from '@/db/schema/enums';

export class SiteDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: 'uuid-here' })
  organizationId: string;

  @ApiPropertyOptional({ example: 'uuid-here', nullable: true })
  groupId: string | null;

  @ApiProperty({ example: 'Indiranagar Store' })
  name: string;

  @ApiPropertyOptional({ example: 'BLR-IND', nullable: true })
  code: string | null;

  @ApiProperty({ enum: SiteAppliesValues, example: 'OUTLET' })
  type: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiProperty({ example: 'Asia/Kolkata' })
  timezone: string;

  @ApiPropertyOptional({ example: 'uuid-here', nullable: true })
  legalEntityId: string | null;

  @ApiPropertyOptional({ example: 'uuid-here', nullable: true })
  registrationId: string | null;

  @ApiPropertyOptional({ nullable: true })
  metadata: Record<string, unknown> | null;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: string;
}
