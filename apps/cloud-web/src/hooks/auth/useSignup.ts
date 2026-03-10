import { type SignupDto, type SignupResponse, signup } from '@services/auth.service';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type UseSignupOptions = Omit<UseMutationOptions<SignupResponse, AxiosError, SignupDto>, 'mutationFn'>;

export function useSignup(options?: UseSignupOptions) {
  return useMutation<SignupResponse, AxiosError, SignupDto>({
    mutationFn: signup,
    ...options,
  });
}
