import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { IdentityVerificationResponse } from '@services/verification.service';
import { requestEmailIdentityVerification } from '@services/verification.service';

type UseRequestEmailIdentityOptions = Omit<UseMutationOptions<IdentityVerificationResponse, AxiosError, void>, 'mutationFn'>;

// Requests identity verification OTP before email change
export function useRequestEmailIdentityVerification(options?: UseRequestEmailIdentityOptions) {
  return useMutation<IdentityVerificationResponse, AxiosError, void>({
    mutationFn: requestEmailIdentityVerification,
    ...options,
  });
}
