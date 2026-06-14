import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { Country, CreateCountryData } from '@/schemas/admin/countries';
import { createCountry } from '@/services/admin/countries.service';
import { COUNTRIES_QUERY_KEY } from './useCountries';

type UseCreateCountryOptions = Omit<
  UseMutationOptions<CreateResponse<Country>, AxiosError, CreateCountryData>,
  'mutationFn'
>;

export function useCreateCountry(options?: UseCreateCountryOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<Country>, AxiosError, CreateCountryData>({
    ...options,
    mutationFn: createCountry,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: COUNTRIES_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
