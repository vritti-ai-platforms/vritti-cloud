import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { OrganizationMemberRow } from '@domain/organization-member/repositories/organization-member.repository';

export class OrganizationMemberDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string;

  @ApiProperty({ example: 'Owner' })
  role: string;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: 'johndoe' })
  displayName: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiPropertyOptional({ nullable: true })
  profilePictureUrl: string | null;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  static from(row: OrganizationMemberRow): OrganizationMemberDto {
    const dto = new OrganizationMemberDto();
    dto.id = row.id;
    dto.userId = row.userId;
    dto.role = row.role;
    dto.fullName = row.fullName;
    dto.displayName = row.displayName;
    dto.email = row.email;
    dto.profilePictureUrl = row.profilePictureUrl;
    dto.createdAt = row.createdAt;
    return dto;
  }
}
