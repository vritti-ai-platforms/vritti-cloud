import { ApiProperty } from '@nestjs/swagger';
import type { OrganizationRow } from '../../repositories/organization.repository';

export class OrganizationDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Acme Corp' })
  name: string;

  @ApiProperty({ example: 'acme-corp' })
  subdomain: string;

  @ApiProperty({ example: 'ACME' })
  orgIdentifier: string;

  @ApiProperty({ example: '10-20' })
  size: string;

  @ApiProperty({ example: 'Starter' })
  planName: string;

  @ApiProperty({ example: 'starter' })
  planCode: string;

  @ApiProperty({ example: 'US East Production' })
  deploymentName: string;

  @ApiProperty({ example: 'https://nexus-us-east.vritti.io' })
  deploymentUrl: string;

  @ApiProperty({ example: 'Technology' })
  industryName: string;

  @ApiProperty({ example: 3 })
  memberCount: number;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  updatedAt: Date | null;

  static from(row: OrganizationRow): OrganizationDto {
    const dto = new OrganizationDto();
    dto.id = row.id;
    dto.name = row.name;
    dto.subdomain = row.subdomain;
    dto.orgIdentifier = row.orgIdentifier;
    dto.size = row.size;
    dto.planName = row.planName;
    dto.planCode = row.planCode;
    dto.deploymentName = row.deploymentName;
    dto.deploymentUrl = row.deploymentUrl;
    dto.industryName = row.industryName;
    dto.memberCount = Number(row.memberCount);
    dto.createdAt = row.createdAt;
    dto.updatedAt = row.updatedAt;
    return dto;
  }
}
