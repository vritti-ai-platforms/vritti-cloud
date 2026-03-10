import { type AuthStatusResponse, getAuthStatus, logout, logoutAll } from '@services/user.service';
import { type UseMutationOptions, type UseQueryOptions, useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type UseAuthStatusOptions = Omit<UseQueryOptions<AuthStatusResponse, AxiosError>, 'queryKey' | 'queryFn'>;

export function useAuthStatus(options?: UseAuthStatusOptions) {
  return useQuery<AuthStatusResponse, AxiosError>({
    queryKey: ['auth', 'status'],
    queryFn: getAuthStatus,
    staleTime: Infinity,
    retry: false,
    throwOnError: false,
    ...options,
  });
}

type UseLogoutOptions = Omit<UseMutationOptions<void, AxiosError, void>, 'mutationFn'>;

export function useLogout(options?: UseLogoutOptions) {
  return useMutation<void, AxiosError, void>({
    mutationFn: logout,
    ...options,
  });
}

type UseLogoutAllOptions = Omit<UseMutationOptions<void, AxiosError, void>, 'mutationFn'>;

export function useLogoutAll(options?: UseLogoutAllOptions) {
  return useMutation<void, AxiosError, void>({
    mutationFn: logoutAll,
    ...options,
  });
}
