import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import { unassignVersionBusiness } from '../../../services/admin/version-businesses.service';
import { VERSION_BUSINESSES_QUERY_KEY } from './useVersionBusinesses';

type Vars = { versionId: string; businessId: string };
type UseUnassignVersionBusinessOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

// Unassigns a business from a version and invalidates the version businesses list
export function useUnassignVersionBusiness(options?: UseUnassignVersionBusinessOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: unassignVersionBusiness,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: VERSION_BUSINESSES_QUERY_KEY(vars.versionId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
