import {
  type BackupCodesResponse,
  initiatePasskeySetup,
  type RegistrationResponseJSON,
  verifyPasskeySetup,
} from '@services/onboarding.service';
import { startRegistration } from '@simplewebauthn/browser';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type UsePasskeyRegistrationOptions = Omit<UseMutationOptions<BackupCodesResponse, AxiosError, void>, 'mutationFn'>;

// Initiates passkey registration, prompts the device, then verifies the credential
export function usePasskeyRegistration(options?: UsePasskeyRegistrationOptions) {
  return useMutation<BackupCodesResponse, AxiosError, void>({
    mutationFn: async () => {
      const { options: regOptions } = await initiatePasskeySetup();
      const credential = await startRegistration({
        optionsJSON: regOptions as Parameters<typeof startRegistration>[0]['optionsJSON'],
      });
      return verifyPasskeySetup(credential as RegistrationResponseJSON);
    },
    ...options,
  });
}
