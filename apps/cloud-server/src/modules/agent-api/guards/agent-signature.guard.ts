import { DeploymentAgentDomainService } from '@domain/deployment-agent/services/deployment-agent.service';
import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import type { DeploymentAgent } from '@/db/schema';

// Fastify request enriched with the raw body (rawBody plugin) and the resolved agent
type AgentRequest = {
  params?: Record<string, string>;
  headers: Record<string, string | string[] | undefined>;
  rawBody?: string;
  deploymentAgent?: DeploymentAgent;
};

// Ed25519 request guard for /agent/* — verifies the raw-body signature + bearer against the enrolled agent key (no JWT/session)
@Injectable()
export class AgentSignatureGuard implements CanActivate {
  constructor(private readonly agentService: DeploymentAgentDomainService) {}

  // Verifies the signed agent request and attaches the resolved agent to the request
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AgentRequest>();
    const agent = await this.agentService.verifyAgentRequest({
      deploymentId: request.params?.id ?? header(request, 'x-vritti-deployment'),
      agentKeyB64: header(request, 'x-vritti-agent-key'),
      signatureB64: header(request, 'x-vritti-signature'),
      rawBody: request.rawBody ?? '',
      bearer: bearerToken(header(request, 'authorization')),
    });
    request.deploymentAgent = agent;
    return true;
  }
}

// Returns a single-valued header (first value if an array)
function header(request: AgentRequest, name: string): string | undefined {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

// Extracts the bearer token from an Authorization header
function bearerToken(authorization: string | undefined): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(' ');
  return scheme?.toLowerCase() === 'bearer' ? token : undefined;
}
