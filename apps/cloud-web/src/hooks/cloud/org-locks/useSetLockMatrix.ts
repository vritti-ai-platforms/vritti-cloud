import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { FeatureLocks } from '@vritti/quantum-ui/types/catalog-resolver';
import type { AxiosError } from 'axios';
import { type LockScope, setLockMatrix } from '@/services/cloud/org-locks.service';
import { ORG_SITE_DETAIL_QUERY_KEY } from '../org-sites/useOrgSite';
import { COMPATIBLE_ROLES_QUERY_KEY } from '../role-assignments/useCompatibleRoles';
import { LOCK_MATRIX_QUERY_KEY } from './useLockMatrix';

type SetLocksPayload = { locks: FeatureLocks };
type UseSetLockMatrixOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, SetLocksPayload>, 'mutationFn'>;

// Saves the scope's lock deny-list and refreshes the matrix (plus site detail/compatible roles for site scope)
export function useSetLockMatrix(scope: LockScope, options?: UseSetLockMatrixOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, SetLocksPayload>({
    ...options,
    mutationFn: (payload) => setLockMatrix({ scope, ...payload }),
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: LOCK_MATRIX_QUERY_KEY(scope) });
      queryClient.invalidateQueries({ queryKey: COMPATIBLE_ROLES_QUERY_KEY(scope) });
      if (scope.kind === 'site') {
        queryClient.invalidateQueries({ queryKey: ORG_SITE_DETAIL_QUERY_KEY(scope.orgId, scope.siteId) });
      }
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
