import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@/services/account/profile.service';
import { resendTargetOtp } from '@/services/account/profile.service';

type UseResendTargetOtpOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, string>, 'mutationFn'>;

export function useResendTargetOtp(options?: UseResendTargetOtpOptions) {
  return useMutation<SuccessResponse, AxiosError, string>({
    mutationFn: resendTargetOtp,
    ...options,
  });
}
