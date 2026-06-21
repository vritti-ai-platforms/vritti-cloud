import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { VersionBusiness } from '@/schemas/admin/version-businesses';
import { assignVersionBusiness } from '@/services/admin/versions/businesses.service';
import { VERSION_BUSINESSES_QUERY_KEY } from './useVersionBusinesses';

type Vars = { versionId: string; businessId: string };
type UseAssignVersionBusinessOptions = Omit<
  UseMutationOptions<CreateResponse<VersionBusiness>, AxiosError, Vars>,
  'mutationFn'
>;

// Assigns a business to a version and invalidates the version businesses list
export function useAssignVersionBusiness(options?: UseAssignVersionBusinessOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<VersionBusiness>, AxiosError, Vars>({
    ...options,
    mutationFn: assignVersionBusiness,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: VERSION_BUSINESSES_QUERY_KEY(vars.versionId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
