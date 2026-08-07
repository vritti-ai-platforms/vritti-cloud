import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

const CONDITION_TYPES = ['Ready', 'Reconciling', 'Blocked', 'Degraded'] as const;
const CONDITION_STATUSES = ['true', 'false', 'unknown'] as const;
const CONDITION_COMPONENTS = ['core', 'database', 'edge', 'gitea', 'secretStore'] as const;
const EVENT_LEVELS = ['info', 'warn', 'error'] as const;

// One reconcile-condition the agent reports (matches cloudapi.Condition)
export class ConditionDto {
  @ApiProperty({ enum: CONDITION_TYPES, example: 'Ready' })
  @IsIn(CONDITION_TYPES)
  type: (typeof CONDITION_TYPES)[number];

  @ApiProperty({ enum: CONDITION_STATUSES, example: 'true' })
  @IsIn(CONDITION_STATUSES)
  status: (typeof CONDITION_STATUSES)[number];

  @ApiProperty({ description: 'Machine reason code', example: 'InSync' })
  @IsString()
  reason: string;

  @ApiProperty({ example: 'All services healthy and in sync.' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ enum: CONDITION_COMPONENTS, example: 'edge' })
  @IsOptional()
  @IsIn(CONDITION_COMPONENTS)
  component?: (typeof CONDITION_COMPONENTS)[number];

  @ApiProperty({ description: 'RFC3339 transition timestamp', example: '2026-07-31T12:00:00Z' })
  @IsString()
  since: string;
}

// One service's runtime status within a heartbeat, tagged with its component (matches cloudapi.ServiceStatus)
export class ServiceStatusDto {
  @ApiProperty({ example: 'core', description: 'Component the service belongs to' })
  @IsString()
  component: string;

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

// One labelled slice of the VM's used disk (matches cloudapi.DiskUsageEntry)
export class DiskUsageEntryDto {
  @ApiProperty({ example: 'docker-images' })
  @IsString()
  name: string;

  @ApiProperty({ example: 3937000000 })
  @IsNumber()
  bytes: number;
}

// Whole-VM resource usage within a heartbeat (matches cloudapi.HostMetrics)
export class HostMetricsDto {
  @ApiProperty({ example: 12.4 })
  @IsNumber()
  cpuPercent: number;

  @ApiProperty({ example: 16777216000 })
  @IsNumber()
  memTotalBytes: number;

  @ApiProperty({ example: 8388608000 })
  @IsNumber()
  memUsedBytes: number;

  @ApiProperty({ example: 53687091200 })
  @IsNumber()
  diskTotalBytes: number;

  @ApiProperty({ example: 16106127360 })
  @IsNumber()
  diskUsedBytes: number;

  @ApiProperty({ type: [DiskUsageEntryDto], description: 'Per-category split of the used disk' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiskUsageEntryDto)
  diskBreakdown: DiskUsageEntryDto[];
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

// One notable transition the agent asks cloud to record on the deployment timeline (matches cloudapi.Event)
export class StatusEventDto {
  @ApiProperty({ enum: EVENT_LEVELS, example: 'info' })
  @IsIn(EVENT_LEVELS)
  level: (typeof EVENT_LEVELS)[number];

  @ApiPropertyOptional({ example: 'edge', description: 'Component the event relates to' })
  @IsOptional()
  @IsString()
  component?: string;

  @ApiProperty({ description: 'Machine reason code', example: 'CertIssued' })
  @IsString()
  reason: string;

  @ApiProperty({ example: 'Wildcard certificate issued for *.apw1.vrittiai.com.' })
  @IsString()
  message: string;
}

// Periodic heartbeat pushed by the agent (matches cloudapi.StatusReport)
export class StatusReportDto {
  @ApiProperty({ description: 'Deployment this heartbeat is for', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  deploymentId: string;

  @ApiProperty({ description: 'Desired-state generation currently applied', example: 3 })
  @IsNumber()
  generation: number;

  @ApiProperty({ type: [ConditionDto], description: 'Reconcile conditions observed by the agent' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionDto)
  conditions: ConditionDto[];

  @ApiProperty({ type: [ServiceStatusDto], description: 'Per-service runtime states, tagged by component' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceStatusDto)
  services: ServiceStatusDto[];

  @ApiPropertyOptional({ type: HostMetricsDto, nullable: true, description: 'Whole-VM resource usage' })
  @IsOptional()
  @ValidateNested()
  @Type(() => HostMetricsDto)
  host?: HostMetricsDto | null;

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
      'Pending DNS-delegation CNAME (present while the edge is Blocked awaiting the operator, absent once issued)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AcmeDelegationDto)
  delegation?: AcmeDelegationDto | null;

  @ApiPropertyOptional({ type: [StatusEventDto], description: 'Notable transitions the agent asks cloud to record' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatusEventDto)
  events?: StatusEventDto[];

  @ApiProperty({
    enum: ['off', 'local', 'local+offsite'],
    description:
      'Managed-DB backup topology: "off" (backups disabled), "local" (repo1 only), or "local+offsite" (repo1 + encrypted S3 repo2).',
    example: 'local+offsite',
  })
  @IsString()
  backupState: string;
}
