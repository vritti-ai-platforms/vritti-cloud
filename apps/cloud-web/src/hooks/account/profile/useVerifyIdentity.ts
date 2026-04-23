import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@/services/account/profile.service';
import { verifyIdentity } from '@/services/account/profile.service';

type UseVerifyIdentityOptions = Omit<
  UseMutationOptions<SuccessResponse, AxiosError, { channel: string; otpCode: string }>,
  'mutationFn'
>;

export function useVerifyIdentity(options?: UseVerifyIdentityOptions) {
  return useMutation<SuccessResponse, AxiosError, { channel: string; otpCode: string }>({
    mutationFn: verifyIdentity,
    ...options,
  });
}
