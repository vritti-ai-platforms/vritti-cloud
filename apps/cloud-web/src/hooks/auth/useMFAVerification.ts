import {
  type AuthenticationResponseJSON,
  type LoginResponse,
  sendSmsCode,
  startPasskeyVerification,
  verifyPasskeyMfa,
  verifySms,
  verifyTotp,
} from '@services/auth.service';
import { startAuthentication } from '@simplewebauthn/browser';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

interface VerifyTotpParams {
  sessionId: string;
  code: string;
}

type UseVerifyTotpOptions = Omit<UseMutationOptions<LoginResponse, AxiosError, VerifyTotpParams>, 'mutationFn'>;

export function useVerifyTotp(options?: UseVerifyTotpOptions) {
  return useMutation<LoginResponse, AxiosError, VerifyTotpParams>({
    mutationFn: ({ sessionId, code }) => verifyTotp(sessionId, code),
    ...options,
  });
}

type UseSendSmsCodeOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

export function useSendSmsCode(options?: UseSendSmsCodeOptions) {
  return useMutation<void, AxiosError, string>({
    mutationFn: sendSmsCode,
    ...options,
  });
}

interface VerifySmsParams {
  sessionId: string;
  code: string;
}

type UseVerifySmsOptions = Omit<UseMutationOptions<LoginResponse, AxiosError, VerifySmsParams>, 'mutationFn'>;

export function useVerifySms(options?: UseVerifySmsOptions) {
  return useMutation<LoginResponse, AxiosError, VerifySmsParams>({
    mutationFn: ({ sessionId, code }) => verifySms(sessionId, code),
    ...options,
  });
}

type UseVerifyPasskeyOptions = Omit<UseMutationOptions<LoginResponse, AxiosError, string>, 'mutationFn'>;

export function useVerifyPasskey(options?: UseVerifyPasskeyOptions) {
  return useMutation<LoginResponse, AxiosError, string>({
    mutationFn: async (mfaSessionId: string) => {
      const { options: authOptions } = await startPasskeyVerification(mfaSessionId);

      const credential = await startAuthentication({
        optionsJSON: authOptions as Parameters<typeof startAuthentication>[0]['optionsJSON'],
      });

      return await verifyPasskeyMfa(mfaSessionId, credential as AuthenticationResponseJSON);
    },
    ...options,
  });
}
