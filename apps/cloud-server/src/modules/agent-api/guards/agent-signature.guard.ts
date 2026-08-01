import { AGENT_TIMESTAMP_SKEW_SECONDS } from '@domain/deployment-agent/deployment-agent.constants';
import { DeploymentAgentDomainService } from '@domain/deployment-agent/services/deployment-agent.service';
import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@vritti/api-sdk/exceptions';
import type { DeploymentAgent } from '@/db/schema';

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

    // Freshness: the agent signs `<timestamp>.<raw body>`, so an empty-body GET is no longer a replayable constant
    const timestamp = header(request, 'x-vritti-timestamp');
    const ts = timestamp !== undefined ? Number.parseInt(timestamp, 10) : Number.NaN;
    if (!timestamp || Number.isNaN(ts)) {
      throw new UnauthorizedException('Missing or invalid request timestamp.');
    }
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSeconds - ts) > AGENT_TIMESTAMP_SKEW_SECONDS) {
      throw new UnauthorizedException('Request timestamp is outside the allowed window.');
    }

    // Signed message bytes = timestamp string + literal '.' + raw request body (body empty for GET)
    const signedMessage = `${timestamp}.${request.rawBody ?? ''}`;
    const agent = await this.agentService.verifyAgentRequest({
      deploymentId: request.params?.id ?? header(request, 'x-vritti-deployment'),
      agentKeyB64: header(request, 'x-vritti-agent-key'),
      signatureB64: header(request, 'x-vritti-signature'),
      rawBody: signedMessage,
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
