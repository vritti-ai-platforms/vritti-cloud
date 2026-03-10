import {
  type InitiateMobileVerificationDto,
  initiateMobileVerification,
  type MobileVerificationStatusResponse,
} from '@services/onboarding.service';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type UseInitiateMobileVerificationOptions = Omit<
  UseMutationOptions<MobileVerificationStatusResponse, AxiosError, InitiateMobileVerificationDto>,
  'mutationFn'
>;

export function useInitiateMobileVerification(options?: UseInitiateMobileVerificationOptions) {
  return useMutation<MobileVerificationStatusResponse, AxiosError, InitiateMobileVerificationDto>({
    mutationFn: initiateMobileVerification,
    ...options,
  });
}
