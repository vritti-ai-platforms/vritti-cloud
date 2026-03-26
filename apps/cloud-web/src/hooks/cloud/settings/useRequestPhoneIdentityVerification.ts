import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { IdentityVerificationResponse } from '@/services/settings/verification.service';
import { requestPhoneIdentityVerification } from '@/services/settings/verification.service';

type UseRequestPhoneIdentityOptions = Omit<
  UseMutationOptions<IdentityVerificationResponse, AxiosError, void>,
  'mutationFn'
>;

// Requests identity verification OTP before phone change
export function useRequestPhoneIdentityVerification(options?: UseRequestPhoneIdentityOptions) {
  return useMutation<IdentityVerificationResponse, AxiosError, void>({
    mutationFn: requestPhoneIdentityVerification,
    ...options,
  });
}
