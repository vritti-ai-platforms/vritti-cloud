import { DeploymentAgentDomainService } from '@domain/deployment-agent/services/deployment-agent.service';
import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import type { DeploymentAgent } from '@/db/schema';
import { agentHeader, agentSignedMessage } from './agent-signed-message';

// Fastify request enriched with the raw body (rawBody plugin) and the resolved agent
type AgentRequest = {
  params?: Record<string, string>;
  headers: Record<string, string | string[] | undefined>;
  rawBody?: string;
  deploymentAgent?: DeploymentAgent;
};

// Ed25519 request guard for /agent/* — verifies a timestamped raw-body signature + bearer against the enrolled agent key (no JWT/session)
@Injectable()
export class AgentSignatureGuard implements CanActivate {
  constructor(private readonly agentService: DeploymentAgentDomainService) {}

  // Verifies the signed agent request and attaches the resolved agent to the request
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AgentRequest>();

    // Freshness + signed message bytes (`<timestamp>.<raw body>`) — shared with the enroll handler.
    const signedMessage = agentSignedMessage(request);
    const agent = await this.agentService.verifyAgentRequest({
      deploymentId: request.params?.id ?? agentHeader(request, 'x-vritti-deployment'),
      agentKeyB64: agentHeader(request, 'x-vritti-agent-key'),
      signatureB64: agentHeader(request, 'x-vritti-signature'),
      rawBody: signedMessage,
      bearer: bearerToken(agentHeader(request, 'authorization')),
    });
    request.deploymentAgent = agent;
    return true;
  }
}

// Extracts the bearer token from an Authorization header
function bearerToken(authorization: string | undefined): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(' ');
  return scheme?.toLowerCase() === 'bearer' ? token : undefined;
}
