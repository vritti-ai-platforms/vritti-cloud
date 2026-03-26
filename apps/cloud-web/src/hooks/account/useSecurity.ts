import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ChangePasswordDto, Session } from '@/schemas/cloud/account';
import { changePassword, getSessions, revokeAllOtherSessions, revokeSession } from '@/services/account/profile.service';

export const SESSIONS_QUERY_KEY = ['sessions'] as const;

export function useChangePassword(
  options?: Omit<UseMutationOptions<void, AxiosError, ChangePasswordDto>, 'mutationFn'>,
) {
  return useMutation<void, AxiosError, ChangePasswordDto>({
    mutationFn: changePassword,
    ...options,
  });
}

export function useSessions(options?: Omit<UseQueryOptions<Session[], AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery<Session[], AxiosError>({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: getSessions,
    ...options,
  });
}

export function useRevokeSession(options?: Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>) {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, string>({
    mutationFn: revokeSession,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      options?.onSuccess?.(...args);
    },
  });
}

export function useRevokeAllOtherSessions(options?: Omit<UseMutationOptions<void, AxiosError, void>, 'mutationFn'>) {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, void>({
    mutationFn: revokeAllOtherSessions,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
