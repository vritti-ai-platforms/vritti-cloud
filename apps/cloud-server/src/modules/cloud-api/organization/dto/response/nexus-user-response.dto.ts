import { ApiProperty } from '@nestjs/swagger';

export class NexusUserResponseDto {
  @ApiProperty({ description: 'User ID', example: 'usr_abc123' })
  id: string;

  @ApiProperty({ description: 'Organization ID', example: 'org_abc123' })
  organizationId: string;

  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User full name', example: 'Jane Smith' })
  fullName: string;

  @ApiProperty({ description: 'User role', example: 'SUPPORT' })
  role: string;

  @ApiProperty({ description: 'User status', example: 'ACTIVE' })
  status: string;

  @ApiProperty({ description: 'Whether the user has set a password', example: true })
  hasPassword: boolean;

  @ApiProperty({ description: 'Account creation timestamp', example: '2026-01-15T10:30:00.000Z' })
  createdAt: string;
}
