import { getPasskeySetupOptions } from '@services/account/security.service';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/browser';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

export function usePasskeySetupOptions(
  options?: Omit<UseMutationOptions<PublicKeyCredentialCreationOptionsJSON, AxiosError, void>, 'mutationFn'>,
) {
  return useMutation<PublicKeyCredentialCreationOptionsJSON, AxiosError, void>({
    mutationFn: getPasskeySetupOptions,
    ...options,
  });
}
