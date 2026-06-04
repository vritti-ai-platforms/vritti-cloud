import { logout, logoutAll } from '@services/user.service';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

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
