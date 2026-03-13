import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { InviteUserFormData, NexusUser } from '@/schemas/cloud/organizations';
import { inviteOrgUser } from '@/services/cloud/organizations.service';
import { ORG_USERS_QUERY_KEY } from './useOrgUsers';

type UseInviteUserOptions = Omit<UseMutationOptions<NexusUser, AxiosError, InviteUserFormData>, 'mutationFn'>;

// Invites a user to the organization in nexus
export function useInviteUser(orgId: string, options?: UseInviteUserOptions) {
  const queryClient = useQueryClient();
  return useMutation<NexusUser, AxiosError, InviteUserFormData>({
    ...options,
    mutationFn: (data) => inviteOrgUser(orgId, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_USERS_QUERY_KEY(orgId) });
      options?.onSuccess?.(...args);
    },
  });
}
