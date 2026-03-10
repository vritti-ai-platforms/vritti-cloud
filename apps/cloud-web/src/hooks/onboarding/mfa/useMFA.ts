import {
  type BackupCodesResponse,
  initiateTotpSetup,
  skipMFASetup,
  type TotpSetupResponse,
  verifyTotpSetup,
} from '@services/onboarding.service';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type UseInitiateTotpSetupOptions = Omit<UseMutationOptions<TotpSetupResponse, AxiosError, void>, 'mutationFn'>;
type UseVerifyTotpSetupOptions = Omit<UseMutationOptions<BackupCodesResponse, AxiosError, string>, 'mutationFn'>;
type UseSkipMFASetupOptions = Omit<
  UseMutationOptions<{ success: boolean; message: string }, AxiosError, void>,
  'mutationFn'
>;

export function useInitiateTotpSetup(options?: UseInitiateTotpSetupOptions) {
  return useMutation<TotpSetupResponse, AxiosError, void>({
    mutationFn: initiateTotpSetup,
    ...options,
  });
}

export function useVerifyTotpSetup(options?: UseVerifyTotpSetupOptions) {
  return useMutation<BackupCodesResponse, AxiosError, string>({
    mutationFn: verifyTotpSetup,
    ...options,
  });
}

export function useSkipMFASetup(options?: UseSkipMFASetupOptions) {
  return useMutation<{ success: boolean; message: string }, AxiosError, void>({
    mutationFn: skipMFASetup,
    ...options,
  });
}
