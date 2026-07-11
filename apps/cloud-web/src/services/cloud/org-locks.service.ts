import { axios } from '@vritti/quantum-ui/axios';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { FeatureLocks, SiteMatrix } from '@vritti/quantum-ui/types/catalog-resolver';

export type LockScope =
  | { kind: 'org'; orgId: string }
  | { kind: 'legalEntity'; orgId: string; leId: string }
  | { kind: 'siteGroup'; orgId: string; groupId: string }
  | { kind: 'site'; orgId: string; siteId: string };

// Resolves the scope's locks endpoint — sites keep their pre-existing /permissions routes
function locksUrl(scope: LockScope): string {
  switch (scope.kind) {
    case 'org':
      return `cloud-api/organizations/${scope.orgId}/locks`;
    case 'legalEntity':
      return `cloud-api/organizations/${scope.orgId}/legal-entities/${scope.leId}/locks`;
    case 'siteGroup':
      return `cloud-api/organizations/${scope.orgId}/site-groups/${scope.groupId}/locks`;
    case 'site':
      return `cloud-api/organizations/${scope.orgId}/sites/${scope.siteId}/permissions`;
  }
}

// Fetches the scope's lock matrix — apps/features/permissions pre-filtered by the backend to the scope
export function getLockMatrix(scope: LockScope): Promise<SiteMatrix> {
  return axios.get<SiteMatrix>(locksUrl(scope)).then((r) => r.data);
}

// Replaces the scope's lock deny-list (code-keyed; platform null locks the feature there, string[] locks those codes)
export function setLockMatrix({ scope, locks }: { scope: LockScope; locks: FeatureLocks }): Promise<SuccessResponse> {
  return axios.put<SuccessResponse>(locksUrl(scope), { locks }).then((r) => r.data);
}
