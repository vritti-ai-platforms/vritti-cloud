import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { InviteUserFormData } from '@/schemas/cloud/organizations';
import { type SuccessResponse, inviteOrgUser } from '@/services/cloud/organizations.service';
import { ORG_USERS_QUERY_KEY } from './useOrgUsers';

type UseInviteUserOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, InviteUserFormData>, 'mutationFn'>;

// Invites a user to the organization in nexus
export function useInviteUser(orgId: string, options?: UseInviteUserOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, InviteUserFormData>({
    ...options,
    mutationFn: (data) => inviteOrgUser(orgId, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_USERS_QUERY_KEY(orgId) });
      options?.onSuccess?.(...args);
    },
  });
}
