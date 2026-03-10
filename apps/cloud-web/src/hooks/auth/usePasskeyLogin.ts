import {
  type AuthenticationResponseJSON,
  type LoginResponse,
  startPasskeyLogin,
  verifyPasskeyLogin,
} from '@services/auth.service';
import { startAuthentication } from '@simplewebauthn/browser';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type UsePasskeyLoginOptions = Omit<UseMutationOptions<LoginResponse, AxiosError, string | undefined>, 'mutationFn'>;

// Handles the full passkey authentication flow: start → browser prompt → verify
export function usePasskeyLogin(options?: UsePasskeyLoginOptions) {
  return useMutation<LoginResponse, AxiosError, string | undefined>({
    mutationFn: async (email?: string) => {
      const { options: authOptions, sessionId } = await startPasskeyLogin(email);
      const credential = await startAuthentication({
        optionsJSON: authOptions as Parameters<typeof startAuthentication>[0]['optionsJSON'],
      });
      return await verifyPasskeyLogin(sessionId, credential as AuthenticationResponseJSON);
    },
    ...options,
  });
}
