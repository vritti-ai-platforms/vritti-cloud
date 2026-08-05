import { AGENT_TIMESTAMP_SKEW_SECONDS } from '@domain/deployment-agent/deployment-agent.constants';
import { UnauthorizedException } from '@vritti/api-sdk/exceptions';

// Reads a single request header (Connect metadata), normalising null → undefined
export function agentHeader(headers: Headers, name: string): string | undefined {
  return headers.get(name) ?? undefined;
}

// Extracts the bearer token from an Authorization header
export function bearerToken(authorization: string | undefined): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(' ');
  return scheme?.toLowerCase() === 'bearer' ? token : undefined;
}

// Validates freshness (x-vritti-timestamp within the skew window) and returns the EXACT bytes the agent
// signs: `<timestamp>.<deploymentId>`. Unlike the old raw-body scheme, the signed message is just
// identity + freshness — TLS already guarantees channel integrity, and matching serialized request
// bytes across Connect encodings is brittle. Both the interceptor and the Enroll handler build the
// message through here so the agent's single signing scheme verifies for every call.
export function agentSignedMessage(headers: Headers, deploymentId: string): string {
  const timestamp = headers.get('x-vritti-timestamp');
  const ts = timestamp !== null ? Number.parseInt(timestamp, 10) : Number.NaN;
  if (!timestamp || Number.isNaN(ts)) {
    throw new UnauthorizedException('Missing or invalid request timestamp.');
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - ts) > AGENT_TIMESTAMP_SKEW_SECONDS) {
    throw new UnauthorizedException('Request timestamp is outside the allowed window.');
  }
  return `${timestamp}.${deploymentId}`;
}
