import type { StatusReportDto } from '@domain/deployment-agent/dto/request/status-report.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { DeploymentAgent, DeploymentAgentStatus } from '@/db/schema';
import { DeploymentAgentStatusValues } from '@/db/schema';
import {
  AgentAcmeDelegationDto,
  AgentCertificateDto,
  AgentConditionDto,
  AgentHostMetricsDto,
  AgentServiceStatusDto,
} from './agent-status.dto';

// The live subset of agent status the AGENT reports each heartbeat/transition, relayed STRAIGHT to the
// browser over SSE (no DB round-trip). The browser merges it onto its initial fetch; the static fields it
// omits (deploymentId, desiredGeneration) don't change on a heartbeat and come from that initial fetch.
// Built entirely from the reported StatusReport + the in-memory agent row — no re-read.
export class AgentLiveStatusDto {
  @ApiPropertyOptional({ enum: DeploymentAgentStatusValues, nullable: true })
  status: DeploymentAgentStatus | null;

  @ApiProperty({ description: 'Whether an agent has enrolled', example: true })
  enrolled: boolean;

  @ApiPropertyOptional({ nullable: true, example: '0.1.0' })
  agentVersion: string | null;

  @ApiProperty({ type: 'string', format: 'date-time' })
  lastHeartbeatAt: Date;

  @ApiProperty({ description: 'Desired-state generation the agent currently has applied', example: 3 })
  lastGeneration: number;

  @ApiProperty({ type: [AgentConditionDto], description: 'Reconcile conditions from this heartbeat' })
  conditions: AgentConditionDto[];

  @ApiProperty({ type: [AgentServiceStatusDto], description: 'Per-service runtime states from this heartbeat' })
  services: AgentServiceStatusDto[];

  @ApiPropertyOptional({ type: AgentHostMetricsDto, nullable: true, description: 'Whole-VM resource usage' })
  host: AgentHostMetricsDto | null;

  @ApiProperty({ type: [AgentCertificateDto], description: 'Managed-edge certificates the agent currently holds' })
  certificates: AgentCertificateDto[];

  @ApiPropertyOptional({ type: AgentAcmeDelegationDto, nullable: true, description: 'Pending DNS delegation' })
  delegation: AgentAcmeDelegationDto | null;

  @ApiProperty({
    enum: ['off', 'local', 'local+offsite'],
    description: 'Managed-DB backups: "off", "local" (repo1 only), or "local+offsite" (repo1 + encrypted S3 repo2)',
  })
  backupState: string;

  // Maps the agent-reported StatusReport (+ the resolved agent row) to the live wire shape — no DB read
  static from(agent: DeploymentAgent, report: StatusReportDto): AgentLiveStatusDto {
    const dto = new AgentLiveStatusDto();
    dto.status = agent.status;
    dto.enrolled = agent.status === 'enrolled';
    dto.agentVersion = agent.agentVersion ?? null;
    dto.lastHeartbeatAt = new Date();
    dto.lastGeneration = report.generation;
    dto.conditions = report.conditions;
    dto.services = report.services;
    dto.host = report.host ?? null;
    dto.certificates = (report.certificates ?? []).map((cert) => ({
      host: cert.host,
      notAfter: new Date(cert.notAfter),
      issuedAt: new Date(cert.issuedAt),
    }));
    dto.delegation = report.delegation ?? null;
    dto.backupState = report.backupState;
    return dto;
  }
}
