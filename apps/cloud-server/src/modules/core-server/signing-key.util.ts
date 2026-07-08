import { BadRequestException } from '@vritti/api-sdk/exceptions';
import type { Deployment } from '@/db/schema';

// Returns the deployment's Ed25519 signing key, failing loudly when none was generated
export function requireSigningKey(deployment: Deployment): string {
  if (!deployment.signingKey) {
    throw new BadRequestException({
      label: 'Signing Key Missing',
      detail: `Deployment "${deployment.name}" has no signing key. Regenerate the deployment's signing key, update the core deployment's CLOUD_PUBLIC_KEY env, then resync.`,
    });
  }
  return deployment.signingKey;
}
