import { useQuery } from '@tanstack/react-query';
import type { SiteMatrix } from '@vritti/quantum-ui/types/catalog-resolver';
import type { AxiosError } from 'axios';
import { getLockMatrix, type LockScope } from '@/services/cloud/org-locks.service';

// Distinguishing id of the scoped entity (the org itself for org scope)
export function lockScopeId(scope: LockScope): string {
  switch (scope.kind) {
    case 'org':
      return scope.orgId;
    case 'legalEntity':
      return scope.leId;
    case 'siteGroup':
      return scope.groupId;
    case 'site':
      return scope.siteId;
  }
}

export const LOCK_MATRIX_QUERY_KEY = (scope: LockScope) =>
  ['organizations', scope.orgId, 'feature-locks', scope.kind, lockScopeId(scope)] as const;

// Fetches the scope's lock matrix — snapshot-driven: its features/permissions with per-platform inPlan/availableIn state
export function useLockMatrix(scope: LockScope) {
  return useQuery<SiteMatrix, AxiosError>({
    queryKey: LOCK_MATRIX_QUERY_KEY(scope),
    queryFn: () => getLockMatrix(scope),
    enabled: !!scope.orgId && !!lockScopeId(scope),
  });
}
