import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { DeploymentAgent, DeploymentAgentStatus, DeploymentCertificate } from '@/db/schema';
import { DeploymentAgentStatusValues } from '@/db/schema';

// One tracked certificate for the deployment (expiry surfaced to the admin console)
export class AgentCertificateDto {
  @ApiProperty({ example: 'api.apw1.vrittiai.com' })
  host: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  notAfter: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  issuedAt: Date;
}

// One reconcile condition from the most recent heartbeat
export class AgentConditionDto {
  @ApiProperty({ enum: ['Ready', 'Reconciling', 'Blocked', 'Degraded'], example: 'Ready' })
  type: 'Ready' | 'Reconciling' | 'Blocked' | 'Degraded';

  @ApiProperty({ enum: ['true', 'false', 'unknown'], example: 'true' })
  status: 'true' | 'false' | 'unknown';

  @ApiProperty({ example: 'InSync' })
  reason: string;

  @ApiProperty({ example: 'All services healthy and in sync.' })
  message: string;

  @ApiPropertyOptional({ enum: ['core', 'database', 'edge', 'gitea', 'secretStore'], example: 'edge' })
  component?: 'core' | 'database' | 'edge' | 'gitea' | 'secretStore';

  @ApiProperty({ description: 'ISO transition timestamp', example: '2026-07-31T12:00:00Z' })
  since: string;
}

// One service's latest reported runtime state (from the most recent heartbeat), tagged by component
export class AgentServiceStatusDto {
  @ApiProperty({ example: 'core' })
  component: string;

  @ApiProperty({ example: 'core-server' })
  service: string;

  @ApiProperty({ example: 'vritti-apw1-core-server' })
  name: string;

  @ApiProperty({ example: 'running' })
  state: string;

  @ApiProperty({ example: 'healthy' })
  health: string;

  @ApiProperty({ example: 1.5 })
  cpuPercent: number;

  @ApiProperty({ example: 134217728 })
  memoryBytes: number;
}

// Whole-VM resource usage from the most recent heartbeat
export class AgentHostMetricsDto {
  @ApiProperty({ example: 12.4 })
  cpuPercent: number;

  @ApiProperty({ example: 16777216000 })
  memTotalBytes: number;

  @ApiProperty({ example: 8388608000 })
  memUsedBytes: number;

  @ApiProperty({ example: 53687091200 })
  diskTotalBytes: number;

  @ApiProperty({ example: 16106127360 })
  diskUsedBytes: number;
}

// Pending DNS delegation the operator must add before the wildcard cert can be issued: the challenge
// CNAME (name → target) plus the one-time zone delegation — `zone NS nameserver` + `nameserver A serverIp`.
export class AgentAcmeDelegationDto {
  @ApiProperty({ example: '_acme-challenge.apw1.vrittiai.com' })
  name: string;

  @ApiProperty({ example: '<id>.acme.apw1.vrittiai.com' })
  target: string;

  @ApiProperty({ description: 'NS record name (the delegated zone)', example: 'acme.apw1.vrittiai.com' })
  zone: string;

  @ApiProperty({
    description: 'NS record value AND the A record name (sibling nameserver)',
    example: 'ns.apw1.vrittiai.com',
  })
  nameserver: string;

  @ApiProperty({ description: 'A record value — the VM public IP', example: '210.79.128.205' })
  serverIp: string;
}

// Agent status for the admin console / connect polling
export class AgentStatusDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  deploymentId: string;

  @ApiProperty({ description: 'Whether an agent has enrolled', example: true })
  enrolled: boolean;

  @ApiPropertyOptional({ enum: DeploymentAgentStatusValues, nullable: true })
  status: DeploymentAgentStatus | null;

  @ApiPropertyOptional({ nullable: true, example: '0.1.0' })
  agentVersion: string | null;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', nullable: true })
  lastHeartbeatAt: Date | null;

  @ApiPropertyOptional({ nullable: true, example: 3 })
  lastGeneration: number | null;

  @ApiProperty({ description: 'Current desired-state generation the cloud has built', example: 3 })
  desiredGeneration: number;

  @ApiPropertyOptional({ nullable: true, description: 'Deployment public key (base64 raw 32-byte Ed25519, Keypair B)' })
  deploymentPubKey: string | null;

  @ApiProperty({ type: [AgentConditionDto], description: 'Reconcile conditions from the last heartbeat' })
  conditions: AgentConditionDto[];

  @ApiProperty({ type: [AgentServiceStatusDto], description: 'Per-service runtime states from the last heartbeat' })
  services: AgentServiceStatusDto[];

  @ApiPropertyOptional({ type: AgentHostMetricsDto, nullable: true, description: 'Latest whole-VM resource usage' })
  host: AgentHostMetricsDto | null;

  @ApiProperty({ type: [AgentCertificateDto], description: 'Certificates tracked for this deployment' })
  certificates: AgentCertificateDto[];

  @ApiPropertyOptional({
    type: AgentAcmeDelegationDto,
    nullable: true,
    description: 'Pending DNS-delegation CNAME the operator must add; null once the wildcard cert has issued',
  })
  delegation: AgentAcmeDelegationDto | null;

  // Maps an agent row (may be absent) plus deployment desired-generation, public key, and tracked certs to the API shape
  static from(
    deploymentId: string,
    agent: DeploymentAgent | undefined,
    desiredGeneration: number,
    deploymentPubKey: string | null,
    certificates: DeploymentCertificate[],
  ): AgentStatusDto {
    const dto = new AgentStatusDto();
    dto.deploymentId = deploymentId;
    dto.enrolled = agent?.status === 'enrolled';
    dto.status = agent?.status ?? null;
    dto.agentVersion = agent?.agentVersion ?? null;
    dto.lastHeartbeatAt = agent?.lastHeartbeatAt ?? null;
    dto.lastGeneration = agent?.lastGeneration ?? null;
    dto.desiredGeneration = desiredGeneration;
    dto.deploymentPubKey = deploymentPubKey;
    dto.conditions = agent?.conditions ?? [];
    dto.services = agent?.services ?? [];
    dto.host = agent?.host ?? null;
    dto.certificates = certificates.map((cert) => ({
      host: cert.host,
      notAfter: cert.notAfter,
      issuedAt: cert.issuedAt,
    }));
    dto.delegation = agent?.delegation ?? null;
    return dto;
  }
}
