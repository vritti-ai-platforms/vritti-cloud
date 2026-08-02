import type { Deployment } from '@/db/schema';

// Resolves the origin core-server actually answers on for a deployment.
//
// `deployed` — an edge (the agent's nginx, or an operator's proxy) terminates TLS for `api.<base>`
// and proxies to core, so the deployment's base url gets an `api.` host prefix. Idempotent when the
// host already starts with `api.`.
//
// `local` — core is reached directly on the deployment's url (a dev tunnel, or core on its own port),
// with no edge in front and no `api.` host to resolve.
export function coreBaseUrl(deployment: Pick<Deployment, 'url' | 'type'>): string {
  const u = new URL(deployment.url);
  if (deployment.type === 'deployed' && !u.hostname.startsWith('api.')) u.hostname = `api.${u.hostname}`;
  return u.origin;
}
