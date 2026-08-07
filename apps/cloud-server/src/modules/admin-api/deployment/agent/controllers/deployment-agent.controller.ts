import { DeploymentAgentDomainService } from '@domain/deployment-agent/services/deployment-agent.service';
import { Controller, Get, HttpCode, HttpStatus, Logger, type MessageEvent, Param, Post, Sse } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession } from '@vritti/api-sdk/auth';
import { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/database';
import type { Observable } from 'rxjs';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiForceRecheck,
  ApiGetAgentStatus,
  ApiIssueEnrollToken,
  ApiRecreateService,
  ApiStreamAgent,
  ApiStreamAgentLogs,
} from '../docs/deployment-agent.docs';
import { AgentStatusDto } from '../dto/entity/agent-status.dto';
import { EnrollTokenDto } from '../dto/response/enroll-token.dto';
import { DeploymentAgentLogsService } from '../services/deployment-agent-logs.service';
import { DeploymentAgentSseService } from '../services/deployment-agent-sse.service';

@ApiTags('Admin - Deployment Agents')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('deployments/:id/agent')
export class DeploymentAgentController {
  private readonly logger = new Logger(DeploymentAgentController.name);

  constructor(
    private readonly agentService: DeploymentAgentDomainService,
    private readonly sseService: DeploymentAgentSseService,
    private readonly logsService: DeploymentAgentLogsService,
  ) {}

  // Streams live agent status + timeline + connectivity via SSE (authenticated by the admin session cookie)
  @Sse('stream')
  @ApiStreamAgent()
  streamAgent(@Param('id') id: string): Observable<MessageEvent> {
    this.logger.log(`SSE /admin-api/deployments/${id}/agent/stream`);
    return this.sseService.stream(id);
  }

  // Streams a container's live logs via SSE (target = "agent" or a service name); request-driven
  @Sse('logs/:target')
  @ApiStreamAgentLogs()
  streamAgentLogs(@Param('id') id: string, @Param('target') target: string): Observable<MessageEvent> {
    this.logger.log(`SSE /admin-api/deployments/${id}/agent/logs/${target}`);
    return this.logsService.stream(id, target);
  }

  // Issues a one-time enroll token for the deployment's agent
  @Post('enroll-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiIssueEnrollToken()
  issueEnrollToken(@Param('id') id: string): Promise<CreateResponseDto<EnrollTokenDto>> {
    this.logger.log(`POST /admin-api/deployments/${id}/agent/enroll-token`);
    return this.agentService.issueEnrollToken(id);
  }

  // Asks the connected agent to reconcile immediately (clears backoff), instead of waiting on the resync
  @Post('recheck')
  @HttpCode(HttpStatus.OK)
  @ApiForceRecheck()
  forceRecheck(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`POST /admin-api/deployments/${id}/agent/recheck`);
    return this.agentService.forceRecheck(id);
  }

  // Recreates one service's container on the connected agent so it picks up the latest env/secrets
  @Post('services/:service/recreate')
  @HttpCode(HttpStatus.OK)
  @ApiRecreateService()
  recreateService(@Param('id') id: string, @Param('service') service: string): Promise<SuccessResponseDto> {
    this.logger.log(`POST /admin-api/deployments/${id}/agent/services/${service}/recreate`);
    return this.agentService.recreateService(id, service);
  }

  // Returns the deployment's agent status
  @Get()
  @ApiGetAgentStatus()
  async getAgentStatus(@Param('id') id: string): Promise<AgentStatusDto> {
    this.logger.log(`GET /admin-api/deployments/${id}/agent`);
    const status = await this.agentService.getAgentStatus(id);
    return AgentStatusDto.from(status.deploymentId, status.agent, status.desiredGeneration, status.connected);
  }
}
