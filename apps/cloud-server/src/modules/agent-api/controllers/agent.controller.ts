import { DeploymentAgentDomainService } from '@domain/deployment-agent/services/deployment-agent.service';
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public, SkipCsrf } from '@vritti/api-sdk/auth';
import { SuccessResponseDto } from '@vritti/api-sdk/database';
import type { FastifyRequest } from 'fastify';
import type { DeploymentAgent } from '@/db/schema';
import { ApiAgentEnroll, ApiAgentStatus, ApiGetDesiredState } from '../docs/agent.docs';
import { EnrollRequestDto } from '../dto/request/enroll-request.dto';
import { StatusReportDto } from '../dto/request/status-report.dto';
import { EnrollResponseDto } from '../dto/response/enroll-response.dto';
import { SignedDesiredStateDto } from '../dto/response/signed-desired-state.dto';
import { AgentSignatureGuard } from '../guards/agent-signature.guard';

// Fastify request carrying the raw body (rawBody plugin) and the guard-resolved agent
type AgentFastifyRequest = FastifyRequest & { rawBody?: string; deploymentAgent?: DeploymentAgent };

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  private readonly logger = new Logger(AgentController.name);

  constructor(private readonly agentService: DeploymentAgentDomainService) {}

  // Enrolls an agent using the one-time token + trust-on-first-use body signature
  @Post('enroll')
  @Public()
  @SkipCsrf()
  @HttpCode(HttpStatus.OK)
  @ApiAgentEnroll()
  enroll(@Body() dto: EnrollRequestDto, @Req() request: AgentFastifyRequest): Promise<EnrollResponseDto> {
    this.logger.log('POST /agent/enroll');
    return this.agentService.enroll(dto, {
      deploymentId: dto.deploymentId,
      agentKeyB64: singleHeader(request, 'x-vritti-agent-key'),
      signatureB64: singleHeader(request, 'x-vritti-signature'),
      rawBody: request.rawBody ?? '',
      bearer: undefined,
    });
  }

  // Returns the current signed desired-state for the deployment
  @Get('deployments/:id/desired-state')
  @Public()
  @SkipCsrf()
  @UseGuards(AgentSignatureGuard)
  @ApiGetDesiredState()
  getDesiredState(@Param('id') id: string): Promise<SignedDesiredStateDto> {
    this.logger.log(`GET /agent/deployments/${id}/desired-state`);
    return this.agentService.getSignedDesiredState(id);
  }

  // Records an agent heartbeat / status report
  @Post('deployments/:id/status')
  @Public()
  @SkipCsrf()
  @UseGuards(AgentSignatureGuard)
  @HttpCode(HttpStatus.OK)
  @ApiAgentStatus()
  async reportStatus(
    @Param('id') id: string,
    @Body() dto: StatusReportDto,
    @Req() request: AgentFastifyRequest,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`POST /agent/deployments/${id}/status`);
    await this.agentService.recordStatus(request.deploymentAgent as DeploymentAgent, dto);
    return { success: true, message: 'Status recorded.' };
  }
}

// Returns a single-valued header from a Fastify request
function singleHeader(request: AgentFastifyRequest, name: string): string | undefined {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}
