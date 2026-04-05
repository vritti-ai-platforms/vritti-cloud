import { ApiProperty } from '@nestjs/swagger';
import { DeploymentTypeValues } from '@/db/schema';
import type { OrganizationDetail } from '@domain/organization/repositories/organization.repository';

export class OrganizationDetailDto {
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

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  planId: string;

  @ApiProperty({ example: 'US East Production' })
  deploymentName: string;

  @ApiProperty({ example: 'https://nexus-us-east.vritti.io' })
  deploymentUrl: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  deploymentId: string;

  @ApiProperty({ enum: DeploymentTypeValues })
  deploymentType: string;

  @ApiProperty({ example: 'Technology' })
  industryName: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  industryId: string;

  @ApiProperty({ example: 'US East' })
  regionName: string;

  @ApiProperty({ example: 'us-east' })
  regionCode: string;

  @ApiProperty({ example: 'Amazon Web Services' })
  cloudProviderName: string;

  @ApiProperty({ example: 'aws' })
  cloudProviderCode: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  updatedAt: Date | null;

  static from(org: OrganizationDetail): OrganizationDetailDto {
    const dto = new OrganizationDetailDto();
    dto.id = org.id;
    dto.name = org.name;
    dto.subdomain = org.subdomain;
    dto.orgIdentifier = org.orgIdentifier;
    dto.size = org.size;
    dto.planName = org.plan.name;
    dto.planCode = org.plan.code;
    dto.planId = org.planId;
    dto.deploymentName = org.deployment.name;
    dto.deploymentUrl = org.deployment.url;
    dto.deploymentId = org.deploymentId;
    dto.deploymentType = org.deployment.type;
    dto.industryName = org.industry.name;
    dto.industryId = org.industryId;
    dto.regionName = org.deployment.region.name;
    dto.regionCode = org.deployment.region.code;
    dto.cloudProviderName = org.deployment.cloudProvider.name;
    dto.cloudProviderCode = org.deployment.cloudProvider.code;
    dto.createdAt = org.createdAt;
    dto.updatedAt = org.updatedAt;
    return dto;
  }
}
