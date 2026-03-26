import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ProfileData, UpdateProfileDto } from '@/schemas/cloud/account';
import { updateProfile } from '@/services/account/account.service';
import { PROFILE_QUERY_KEY } from './useProfile';

type UseUpdateProfileOptions = Omit<UseMutationOptions<ProfileData, AxiosError, UpdateProfileDto>, 'mutationFn'>;

// Updates the user profile and syncs the cache
export function useUpdateProfile(options?: UseUpdateProfileOptions) {
  const queryClient = useQueryClient();

  return useMutation<ProfileData, AxiosError, UpdateProfileDto>({
    ...options,
    mutationFn: updateProfile,
    onSuccess: (data, ...args) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
      options?.onSuccess?.(data, ...args);
    },
  });
}
