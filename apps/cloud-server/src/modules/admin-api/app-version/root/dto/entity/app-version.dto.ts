import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AppVersion } from '@/db/schema';

export class AppVersionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '1.0.0' })
  version: string;

  @ApiProperty({ example: 'Initial Release' })
  name: string;

  @ApiProperty({ example: 'ALPHA' })
  status: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', nullable: true })
  parentVersionId: string | null;

  @ApiPropertyOptional({ nullable: true })
  snapshot: unknown | null;

  @ApiPropertyOptional({ nullable: true })
  artifacts: unknown | null;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: string;

  // Maps an AppVersion entity to an AppVersionDto
  static from(entity: AppVersion): AppVersionDto {
    const dto = new AppVersionDto();
    dto.id = entity.id;
    dto.version = entity.version;
    dto.name = entity.name;
    dto.status = entity.status;
    dto.parentVersionId = entity.parentVersionId;
    dto.snapshot = entity.snapshot;
    dto.artifacts = entity.artifacts;
    dto.createdAt = entity.createdAt.toISOString();
    return dto;
  }
}
