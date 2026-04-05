import type { BackupCodesResponse } from '@services/account/security.service';
import { getPasskeySetupOptions, verifyPasskeySetup } from '@services/account/security.service';
import { startRegistration } from '@simplewebauthn/browser';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { PASSKEYS_QUERY_KEY } from './useListPasskeys';
import { MFA_STATUS_QUERY_KEY } from './useMfaStatus';

// Initiates passkey registration, prompts the device, then verifies the credential
export function useVerifyPasskeySetup(
  options?: Omit<UseMutationOptions<BackupCodesResponse, AxiosError, void>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();

  return useMutation<BackupCodesResponse, AxiosError, void>({
    mutationFn: async () => {
      const regOptions = await getPasskeySetupOptions();
      const credential = await startRegistration({
        optionsJSON: regOptions,
      });
      return verifyPasskeySetup({ credential });
    },
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: MFA_STATUS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PASSKEYS_QUERY_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
