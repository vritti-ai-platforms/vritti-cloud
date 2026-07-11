import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleAssignmentDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: 'uuid-here' })
  userId: string;

  @ApiProperty({ example: 'uuid-here' })
  roleId: string;

  @ApiPropertyOptional({ example: 'uuid-here', nullable: true })
  siteId: string | null;

  @ApiPropertyOptional({ example: 'uuid-here', nullable: true })
  siteGroupId: string | null;

  @ApiPropertyOptional({ example: 'uuid-here', nullable: true })
  legalEntityId: string | null;

  @ApiProperty({ example: 'DIRECT' })
  assignmentType: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: 'Jane Doe' })
  userName: string;

  @ApiProperty({ example: 'jane@acme.com' })
  userEmail: string;

  @ApiProperty({ example: 'Cashier' })
  roleName: string;
}
