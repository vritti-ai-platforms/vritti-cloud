import { DeploymentAgentDomainService } from '@domain/deployment-agent/services/deployment-agent.service';
import { Controller, Get, HttpCode, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession } from '@vritti/api-sdk/auth';
import { CreateResponseDto } from '@vritti/api-sdk/database';
import { SessionTypeValues } from '@/db/schema';
import { ApiGetAgentStatus, ApiIssueEnrollToken } from '../docs/deployment-agent.docs';
import { AgentStatusDto } from '../dto/entity/agent-status.dto';
import { EnrollTokenDto } from '../dto/response/enroll-token.dto';

@ApiTags('Admin - Deployment Agents')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('deployments/:id/agent')
export class DeploymentAgentController {
  private readonly logger = new Logger(DeploymentAgentController.name);

  constructor(private readonly agentService: DeploymentAgentDomainService) {}

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
}
