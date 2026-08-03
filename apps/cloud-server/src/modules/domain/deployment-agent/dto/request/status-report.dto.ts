import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

// One service's runtime status within a heartbeat (matches cloudapi.ContainerReport)
export class ContainerReportDto {
  @ApiProperty({ example: 'core-server' })
  @IsString()
  service: string;

  @ApiProperty({ example: 'vritti-apw1-core-server' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'running' })
  @IsString()
  state: string;

  @ApiProperty({ example: 'healthy' })
  @IsString()
  health: string;

  @ApiProperty({ example: 1.5 })
  @IsNumber()
  cpuPercent: number;

  @ApiProperty({ example: 134217728 })
  @IsNumber()
  memoryBytes: number;
}

// One managed-edge certificate the agent currently holds (matches cloudapi.CertificateReport)
export class CertificateReportDto {
  @ApiProperty({ example: 'api.apw1.vrittiai.com' })
  @IsString()
  host: string;

  @ApiProperty({ description: 'RFC3339 certificate expiry', example: '2026-10-29T12:00:00Z' })
  @IsString()
  notAfter: string;

  @ApiProperty({ description: 'RFC3339 certificate issuance', example: '2026-07-31T12:00:00Z' })
  @IsString()
  issuedAt: string;
}

// One-time DNS-delegation CNAME the operator must add before the wildcard cert can be issued (matches cloudapi.AcmeDelegation)
export class AcmeDelegationDto {
  @ApiProperty({ description: 'CNAME record name', example: '_acme-challenge.apw1.vrittiai.com' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'CNAME record value', example: '<id>.acme.apw1.vrittiai.com' })
  @IsString()
  target: string;

  @ApiProperty({ description: 'NS record name (the delegated zone)', example: 'acme.apw1.vrittiai.com' })
  @IsString()
  zone: string;

  @ApiProperty({
    description: 'NS record value AND the A record name (sibling nameserver)',
    example: 'ns.apw1.vrittiai.com',
  })
  @IsString()
  nameserver: string;

  @ApiProperty({ description: 'A record value — the VM public IP', example: '210.79.128.205' })
  @IsString()
  serverIp: string;
}

// Periodic heartbeat pushed by the agent (matches cloudapi.StatusReport)
export class StatusReportDto {
  @ApiProperty({ description: 'Deployment this heartbeat is for', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  deploymentId: string;

  @ApiProperty({ description: 'Desired-state generation currently applied', example: 3 })
  @IsNumber()
  generation: number;

  @ApiProperty({ description: 'Lifecycle phase', example: 'ready' })
  @IsString()
  phase: string;

  @ApiPropertyOptional({ description: 'Human-readable status detail' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ type: [ContainerReportDto], description: 'Per-service container states' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContainerReportDto)
  containers?: ContainerReportDto[];

  @ApiPropertyOptional({ description: 'Whether the Gitea app user + PAT are provisioned' })
  @IsOptional()
  @IsBoolean()
  giteaProvisioned?: boolean;

  @ApiPropertyOptional({
    type: [CertificateReportDto],
    description: 'Managed-edge certificates the agent currently holds',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificateReportDto)
  certificates?: CertificateReportDto[];

  @ApiPropertyOptional({
    type: AcmeDelegationDto,
    nullable: true,
    description:
      'Pending DNS-delegation CNAME (present while the wildcard cert awaits the operator, absent once issued)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AcmeDelegationDto)
  acmeDelegation?: AcmeDelegationDto | null;
}
