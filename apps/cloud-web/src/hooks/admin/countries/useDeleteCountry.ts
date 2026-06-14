import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteCountry } from '@/services/admin/countries.service';
import { COUNTRIES_QUERY_KEY } from './useCountries';

type UseDeleteCountryOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

export function useDeleteCountry(options?: UseDeleteCountryOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: deleteCountry,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: COUNTRIES_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
