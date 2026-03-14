import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { type SuccessResponse, resendUserInvite } from '@/services/cloud/organizations.service';
import { ORG_USERS_QUERY_KEY } from './useOrgUsers';

type UseResendInviteOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, string>, 'mutationFn'>;

// Resends invitation email to a pending user
export function useResendInvite(orgId: string, options?: UseResendInviteOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, string>({
    ...options,
    mutationFn: (userId) => resendUserInvite(orgId, userId),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_USERS_QUERY_KEY(orgId) });
      options?.onSuccess?.(...args);
    },
  });
}
