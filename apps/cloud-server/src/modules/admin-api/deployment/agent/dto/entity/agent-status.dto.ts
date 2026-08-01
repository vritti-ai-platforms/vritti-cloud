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

  @ApiPropertyOptional({ nullable: true, example: 'ready' })
  lastPhase: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'reconciled 6 services' })
  lastMessage: string | null;

  @ApiPropertyOptional({ nullable: true, example: 3 })
  lastGeneration: number | null;

  @ApiProperty({ description: 'Current desired-state generation the cloud has built', example: 3 })
  desiredGeneration: number;

  @ApiProperty({ example: false })
  giteaProvisioned: boolean;

  @ApiPropertyOptional({ nullable: true, description: 'Deployment public key (base64 raw 32-byte Ed25519, Keypair B)' })
  deploymentPubKey: string | null;

  @ApiProperty({ type: [AgentCertificateDto], description: 'Certificates tracked for this deployment' })
  certificates: AgentCertificateDto[];

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
    dto.lastPhase = agent?.lastPhase ?? null;
    dto.lastMessage = agent?.lastMessage ?? null;
    dto.lastGeneration = agent?.lastGeneration ?? null;
    dto.desiredGeneration = desiredGeneration;
    dto.giteaProvisioned = agent?.giteaProvisioned ?? false;
    dto.deploymentPubKey = deploymentPubKey;
    dto.certificates = certificates.map((cert) => ({
      host: cert.host,
      notAfter: cert.notAfter,
      issuedAt: cert.issuedAt,
    }));
    return dto;
  }
}
