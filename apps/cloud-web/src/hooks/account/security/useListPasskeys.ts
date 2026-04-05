import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { PasskeyData } from '@services/account/security.service';
import { listPasskeys } from '@services/account/security.service';

export const PASSKEYS_QUERY_KEY = ['account', 'security', 'passkeys'] as const;

export function useListPasskeys(
  options?: Omit<UseQueryOptions<PasskeyData[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<PasskeyData[], AxiosError>({
    queryKey: PASSKEYS_QUERY_KEY,
    queryFn: listPasskeys,
    ...options,
  });
}
