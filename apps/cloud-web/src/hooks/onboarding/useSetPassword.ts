import { type SetPasswordResponse, setPassword } from '@services/onboarding.service';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type UseSetPasswordOptions = Omit<UseMutationOptions<SetPasswordResponse, AxiosError, string>, 'mutationFn'>;

export function useSetPassword(options?: UseSetPasswordOptions) {
  return useMutation<SetPasswordResponse, AxiosError, string>({
    mutationFn: setPassword,
    ...options,
  });
}
