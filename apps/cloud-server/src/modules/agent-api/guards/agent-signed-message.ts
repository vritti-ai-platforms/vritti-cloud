import { AGENT_TIMESTAMP_SKEW_SECONDS } from '@domain/deployment-agent/deployment-agent.constants';
import { UnauthorizedException } from '@vritti/api-sdk/exceptions';

// Minimal shape of a Fastify request carrying headers + the raw body (rawBody plugin)
type SignedRequest = {
  headers: Record<string, string | string[] | undefined>;
  rawBody?: string;
};

// Returns a single-valued header (first value if an array)
export function agentHeader(request: SignedRequest, name: string): string | undefined {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

// Validates freshness (x-vritti-timestamp within the skew window) and returns the EXACT bytes the
// agent signs: `<timestamp>.<raw body>`. The agent uses ONE signing scheme for every request, so
// both the enroll handler (trust-on-first-use) and the AgentSignatureGuard (enrolled requests) must
// reconstruct the signed message through here — otherwise an enroll signature can never verify.
export function agentSignedMessage(request: SignedRequest): string {
  const timestamp = agentHeader(request, 'x-vritti-timestamp');
  const ts = timestamp !== undefined ? Number.parseInt(timestamp, 10) : Number.NaN;
  if (!timestamp || Number.isNaN(ts)) {
    throw new UnauthorizedException('Missing or invalid request timestamp.');
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - ts) > AGENT_TIMESTAMP_SKEW_SECONDS) {
    throw new UnauthorizedException('Request timestamp is outside the allowed window.');
  }
  return `${timestamp}.${request.rawBody ?? ''}`;
}
