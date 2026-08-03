import type { Deployment } from '@/db/schema';

// Resolves the origin core-server actually answers on for a deployment.
//
// An edge component (the agent's nginx, or an operator's external proxy) terminates TLS for `api.<base>`
// and proxies to core, so the deployment's base url gets an `api.` host prefix. Idempotent when the host
// already starts with `api.`.
//
// With no edge component (a manual/self-hosted deployment, or a dev tunnel), core is reached directly on
// the deployment's url, with no `api.` host to resolve.
export function coreBaseUrl(deployment: Pick<Deployment, 'url' | 'spec'>): string {
  const u = new URL(deployment.url);
  const hasEdge = deployment.spec?.components?.edge != null;
  if (hasEdge && !u.hostname.startsWith('api.')) u.hostname = `api.${u.hostname}`;
  return u.origin;
}
