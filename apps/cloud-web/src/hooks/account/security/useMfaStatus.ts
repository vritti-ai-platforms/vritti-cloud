import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { MfaStatusData } from '@services/account/security.service';
import { getMfaStatus } from '@services/account/security.service';

export const MFA_STATUS_QUERY_KEY = ['account', 'security', 'mfa-status'] as const;

export function useMfaStatus(
  options?: Omit<UseQueryOptions<MfaStatusData, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<MfaStatusData, AxiosError>({
    queryKey: MFA_STATUS_QUERY_KEY,
    queryFn: getMfaStatus,
    ...options,
  });
}
