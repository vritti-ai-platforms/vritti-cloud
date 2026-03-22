import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Role, RoleScope } from '@/db/schema';

export class RoleDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Chef' })
  name: string;

  @ApiPropertyOptional({ example: 'Kitchen staff responsible for food preparation', nullable: true })
  description: string | null;

  @ApiProperty({ example: 'GLOBAL', enum: ['GLOBAL', 'SUBTREE', 'SINGLE_BU'] })
  scope: RoleScope;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', nullable: true })
  industryId: string | null;

  @ApiPropertyOptional({ example: 'Restaurant', nullable: true })
  industryName: string | null;

  @ApiProperty({ example: false })
  isSystem: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 12 })
  permissionCount: number;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', nullable: true })
  updatedAt: Date | null;

  // Maps a Role entity to a RoleDto
  static from(role: Role, permissionCount: number, industryName?: string | null): RoleDto {
    const dto = new RoleDto();
    dto.id = role.id;
    dto.name = role.name;
    dto.description = role.description;
    dto.scope = role.scope;
    dto.industryId = role.industryId;
    dto.industryName = industryName ?? null;
    dto.isSystem = role.isSystem;
    dto.isActive = role.isActive;
    dto.permissionCount = permissionCount;
    dto.createdAt = role.createdAt;
    dto.updatedAt = role.updatedAt;
    return dto;
  }
}
