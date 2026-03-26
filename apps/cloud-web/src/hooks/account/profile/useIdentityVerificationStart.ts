import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { identityVerificationStart } from '@/services/account/profile.service';

type UseIdentityVerificationStartOptions = Omit<
  UseMutationOptions<{ expiresAt: string }, AxiosError, string>,
  'mutationFn'
>;

export function useIdentityVerificationStart(options?: UseIdentityVerificationStartOptions) {
  return useMutation<{ expiresAt: string }, AxiosError, string>({
    mutationFn: identityVerificationStart,
    ...options,
  });
}
