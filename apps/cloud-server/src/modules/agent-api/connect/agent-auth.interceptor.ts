import { Code, ConnectError, type Interceptor } from '@connectrpc/connect';
import type { DeploymentAgentDomainService } from '@domain/deployment-agent/services/deployment-agent.service';
import { agentHeader, agentSignedMessage, bearerToken } from './agent-connect.auth';
import { kAgent } from './agent-connect.context';

// Connect Ed25519 auth for agent.v1.AgentService. Every method EXCEPT Enroll (trust-on-first-use, verified
// inside its handler) must present the 5 agent headers; the signature is verified over `<ts>.<deploymentId>`
// via the existing DeploymentAgentDomainService.verifyAgentRequest, and the resolved agent is stashed in the
// Connect request context (kAgent) for the handlers. Applies to unary and streaming calls alike (auth runs
// once, before the stream opens).
export function createAgentAuthInterceptor(domain: DeploymentAgentDomainService): Interceptor {
  return (next) => async (req) => {
    if (req.method.name === 'Enroll') {
      return next(req);
    }
    const deploymentId = agentHeader(req.header, 'x-vritti-deployment');
    try {
      const agent = await domain.verifyAgentRequest({
        deploymentId,
        agentKeyB64: agentHeader(req.header, 'x-vritti-agent-key'),
        signatureB64: agentHeader(req.header, 'x-vritti-signature'),
        rawBody: agentSignedMessage(req.header, deploymentId ?? ''),
        bearer: bearerToken(agentHeader(req.header, 'authorization')),
      });
      req.contextValues.set(kAgent, agent);
    } catch (err) {
      // Translate api-sdk HttpExceptions (thrown by verifyAgentRequest) into a Connect Unauthenticated
      // status — the Nest HttpExceptionFilter does not run for Connect routes.
      throw ConnectError.from(err, Code.Unauthenticated);
    }
    return next(req);
  };
}
