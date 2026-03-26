import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@/services/account/profile.service';
import { verifyNewTarget } from '@/services/account/profile.service';
import { PROFILE_QUERY_KEY } from './useProfile';

type UseVerifyNewTargetOptions = Omit<
  UseMutationOptions<SuccessResponse, AxiosError, { channel: string; otpCode: string }>,
  'mutationFn'
>;

export function useVerifyNewTarget(options?: UseVerifyNewTargetOptions) {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse, AxiosError, { channel: string; otpCode: string }>({
    ...options,
    mutationFn: verifyNewTarget,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
