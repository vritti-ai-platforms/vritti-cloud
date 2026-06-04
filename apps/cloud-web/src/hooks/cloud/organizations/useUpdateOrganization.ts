import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@/services/cloud/organizations.service';
import { updateOrganization } from '@/services/cloud/organizations.service';
import { MY_ORGS_QUERY_KEY } from './useMyOrgs';
import { ORG_QUERY_KEY } from './useOrganization';

type UseUpdateOrgOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, FormData>, 'mutationFn'>;

// Mutation hook to update an organization and invalidate related queries
export function useUpdateOrganization(orgId: string, { onSuccess, ...options }: UseUpdateOrgOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, FormData>({
    ...options,
    mutationFn: (data: FormData) => updateOrganization(orgId, data),
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEY(orgId) });
      queryClient.invalidateQueries({ queryKey: MY_ORGS_QUERY_KEY() });
      onSuccess?.(data, ...args);
    },
  });
}
