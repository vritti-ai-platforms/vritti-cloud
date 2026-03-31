import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { RoleScope, RoleTemplate } from '@/db/schema';

export class RoleTemplateDto {
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

  // Maps a RoleTemplate entity to a RoleTemplateDto
  static from(roleTemplate: RoleTemplate, permissionCount: number, industryName?: string | null): RoleTemplateDto {
    const dto = new RoleTemplateDto();
    dto.id = roleTemplate.id;
    dto.name = roleTemplate.name;
    dto.description = roleTemplate.description;
    dto.scope = roleTemplate.scope;
    dto.industryId = roleTemplate.industryId;
    dto.industryName = industryName ?? null;
    dto.isSystem = roleTemplate.isSystem;
    dto.isActive = roleTemplate.isActive;
    dto.permissionCount = permissionCount;
    dto.createdAt = roleTemplate.createdAt;
    dto.updatedAt = roleTemplate.updatedAt;
    return dto;
  }
}
