import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { OrgListItem } from '@/schemas/cloud/organizations';
import { createOrganization } from '@/services/cloud/organizations.service';
import { MY_ORGS_QUERY_KEY } from './useMyOrgs';

type UseCreateOrgOptions = Omit<UseMutationOptions<OrgListItem, AxiosError, FormData>, 'mutationFn'>;

// Mutation hook to create a new organization and invalidate the orgs list
export function useCreateOrganization({ onSuccess, ...options }: UseCreateOrgOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation<OrgListItem, AxiosError, FormData>({
    ...options,
    mutationFn: createOrganization,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: MY_ORGS_QUERY_KEY() });
      onSuccess?.(data, ...args);
    },
  });
}
