import { DeploymentAgentDomainService } from '@domain/deployment-agent/services/deployment-agent.service';
import { DeploymentEventDomainService } from '@domain/deployment-event/services/deployment-event.service';
import { Controller, Get, HttpCode, HttpStatus, Logger, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession } from '@vritti/api-sdk/auth';
import { CreateResponseDto } from '@vritti/api-sdk/database';
import { SessionTypeValues } from '@/db/schema';
import { ApiGetAgentEvents, ApiGetAgentStatus, ApiIssueEnrollToken } from '../docs/deployment-agent.docs';
import { AgentStatusDto } from '../dto/entity/agent-status.dto';
import { DeploymentEventDto } from '../dto/entity/deployment-event.dto';
import { DeploymentEventsResponseDto } from '../dto/response/deployment-events-response.dto';
import { EnrollTokenDto } from '../dto/response/enroll-token.dto';

@ApiTags('Admin - Deployment Agents')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('deployments/:id/agent')
export class DeploymentAgentController {
  private readonly logger = new Logger(DeploymentAgentController.name);

  constructor(
    private readonly agentService: DeploymentAgentDomainService,
    private readonly eventService: DeploymentEventDomainService,
  ) {}

  // Issues a one-time enroll token for the deployment's agent
  @Post('enroll-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiIssueEnrollToken()
  issueEnrollToken(@Param('id') id: string): Promise<CreateResponseDto<EnrollTokenDto>> {
    this.logger.log(`POST /admin-api/deployments/${id}/agent/enroll-token`);
    return this.agentService.issueEnrollToken(id);
  }

  // Returns the deployment's agent status
  @Get()
  @ApiGetAgentStatus()
  async getAgentStatus(@Param('id') id: string): Promise<AgentStatusDto> {
    this.logger.log(`GET /admin-api/deployments/${id}/agent`);
    const status = await this.agentService.getAgentStatus(id);
    return AgentStatusDto.from(
      status.deploymentId,
      status.agent,
      status.desiredGeneration,
      status.deploymentPubKey,
      status.certificates,
    );
  }

  // Returns a newest-first, cursor-paginated page of the deployment's event timeline
  @Get('events')
  @ApiGetAgentEvents()
  async getAgentEvents(
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
  ): Promise<DeploymentEventsResponseDto> {
    this.logger.log(`GET /admin-api/deployments/${id}/agent/events`);
    const page = await this.eventService.listByDeployment(id, cursor);
    return { result: page.events.map((event) => DeploymentEventDto.from(event)), nextCursor: page.nextCursor };
  }
}
