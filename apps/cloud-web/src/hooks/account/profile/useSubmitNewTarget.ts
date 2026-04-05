import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { submitNewTarget } from '@/services/account/profile.service';

type SubmitNewTargetData = { channel: string; target: string };

type UseSubmitNewTargetOptions = Omit<UseMutationOptions<{ expiresAt: string }, AxiosError, SubmitNewTargetData>, 'mutationFn'>;

export function useSubmitNewTarget(options?: UseSubmitNewTargetOptions) {
  return useMutation<{ expiresAt: string }, AxiosError, SubmitNewTargetData>({
    mutationFn: submitNewTarget,
    ...options,
  });
}
