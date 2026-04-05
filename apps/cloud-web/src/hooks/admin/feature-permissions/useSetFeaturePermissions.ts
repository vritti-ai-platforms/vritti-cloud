import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { setFeaturePermissions } from '../../../services/admin/feature-permissions.service';
import { featurePermissionsKey } from './useFeaturePermissions';

type SetPermissionsVars = { versionId: string; featureId: string; types: string[] };
type UseSetFeaturePermissionsOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, SetPermissionsVars>, 'mutationFn'>;

// Sets feature permissions and invalidates the cache
export function useSetFeaturePermissions(options?: UseSetFeaturePermissionsOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, SetPermissionsVars>({
    ...options,
    mutationFn: ({ versionId, featureId, types }) => setFeaturePermissions(versionId, featureId, types),
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: featurePermissionsKey(vars.versionId, vars.featureId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
