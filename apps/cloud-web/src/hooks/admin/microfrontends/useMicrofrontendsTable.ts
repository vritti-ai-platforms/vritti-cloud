import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { MicrofrontendsTableResponse } from '@/schemas/admin/microfrontends';
import { getMicrofrontendsTable } from '../../../services/admin/microfrontends.service';

export function microfrontendsTableKey(versionId: string) {
  return ['admin', 'microfrontends', versionId, 'table'] as const;
}

// Fetches microfrontends for a version — server applies filter/sort state
export function useMicrofrontendsTable(
  versionId: string,
  options?: Omit<UseQueryOptions<MicrofrontendsTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<MicrofrontendsTableResponse, AxiosError>({
    queryKey: microfrontendsTableKey(versionId),
    queryFn: () => getMicrofrontendsTable(versionId),
    enabled: !!versionId,
    ...options,
  });
}
