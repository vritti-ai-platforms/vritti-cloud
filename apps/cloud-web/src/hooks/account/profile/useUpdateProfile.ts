import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@/services/account/profile.service';
import { updateProfile } from '@/services/account/profile.service';
import { PROFILE_QUERY_KEY } from './useProfile';

type UseUpdateProfileOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, FormData>, 'mutationFn'>;

export function useUpdateProfile(options?: UseUpdateProfileOptions) {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse, AxiosError, FormData>({
    ...options,
    mutationFn: updateProfile,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
