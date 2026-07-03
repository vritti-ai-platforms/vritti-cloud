import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { UpdateCountryData } from '@/schemas/admin/countries';
import { updateCountry } from '@/services/admin/countries.service';
import { COUNTRIES_QUERY_KEY } from './useCountries';

type Vars = { id: string; data: UpdateCountryData };
type UseUpdateCountryOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

export function useUpdateCountry(options?: UseUpdateCountryOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: updateCountry,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: COUNTRIES_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
