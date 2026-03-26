import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RequestChangeResponse } from '@/services/settings/verification.service';
import { requestEmailChange } from '@/services/settings/verification.service';

type UseRequestEmailChangeOptions = Omit<
  UseMutationOptions<RequestChangeResponse, AxiosError, { newEmail: string }>,
  'mutationFn'
>;

// Submits a new email address for change
export function useRequestEmailChange(options?: UseRequestEmailChangeOptions) {
  return useMutation<RequestChangeResponse, AxiosError, { newEmail: string }>({
    mutationFn: requestEmailChange,
    ...options,
  });
}
