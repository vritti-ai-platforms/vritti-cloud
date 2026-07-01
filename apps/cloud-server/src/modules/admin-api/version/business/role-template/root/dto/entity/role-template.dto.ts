import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { RoleTemplate } from '@/db/schema';

export class RoleTemplateDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Chef' })
  name: string;

  @ApiPropertyOptional({ example: 'Kitchen staff responsible for food preparation', nullable: true })
  description: string | null;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  businessId: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', nullable: true })
  updatedAt: Date | null;

  // Maps a RoleTemplate entity to a RoleTemplateDto
  static from(roleTemplate: RoleTemplate): RoleTemplateDto {
    const dto = new RoleTemplateDto();
    dto.id = roleTemplate.id;
    dto.name = roleTemplate.name;
    dto.description = roleTemplate.description;
    dto.businessId = roleTemplate.businessId;
    dto.createdAt = roleTemplate.createdAt;
    dto.updatedAt = roleTemplate.updatedAt;
    return dto;
  }
}
