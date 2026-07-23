import { type OAuthVerifyEmailResponse, verifyOAuthEmail } from '@services/auth.service';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type UseVerifyOAuthEmailOptions = Omit<UseMutationOptions<OAuthVerifyEmailResponse, AxiosError, string>, 'mutationFn'>;

export function useVerifyOAuthEmail(options?: UseVerifyOAuthEmailOptions) {
  return useMutation<OAuthVerifyEmailResponse, AxiosError, string>({
    mutationFn: verifyOAuthEmail,
    ...options,
  });
}
