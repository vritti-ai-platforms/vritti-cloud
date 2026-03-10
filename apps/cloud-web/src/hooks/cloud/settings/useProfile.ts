import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ProfileData, UpdateProfileDto } from '@/schemas/cloud/settings';
import { deleteAccount, getProfile, updateProfile } from '@/services/cloud/settings.service';

export const PROFILE_QUERY_KEY = ['profile'] as const;

export function useProfile(options?: Omit<UseQueryOptions<ProfileData, AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery<ProfileData, AxiosError>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getProfile,
    ...options,
  });
}

type UseUpdateProfileOptions = Omit<UseMutationOptions<ProfileData, AxiosError, UpdateProfileDto>, 'mutationFn'>;

export function useUpdateProfile(options?: UseUpdateProfileOptions) {
  const queryClient = useQueryClient();

  return useMutation<ProfileData, AxiosError, UpdateProfileDto>({
    mutationFn: updateProfile,
    onSuccess: (data, ...args) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
      options?.onSuccess?.(data, ...args);
    },
    ...options,
  });
}

type UseDeleteAccountOptions = Omit<UseMutationOptions<void, AxiosError, void>, 'mutationFn'>;

export function useDeleteAccount(options?: UseDeleteAccountOptions) {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, void>({
    mutationFn: deleteAccount,
    onSuccess: (...args) => {
      queryClient.clear();
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
