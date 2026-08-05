import { createContextKey } from '@connectrpc/connect';
import type { DeploymentAgent } from '@/db/schema';

// Connect request-context slot holding the agent resolved by the auth interceptor. Undefined on Enroll
// (trust-on-first-use, no enrolled agent yet) and until the interceptor sets it on authenticated calls.
export const kAgent = createContextKey<DeploymentAgent | undefined>(undefined);
