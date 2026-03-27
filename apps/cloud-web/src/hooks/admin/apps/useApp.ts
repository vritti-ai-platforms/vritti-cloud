import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { App } from '@/schemas/admin/apps';
import { getApp } from '../../../services/admin/apps.service';

export function appQueryKey(versionId: string, id: string) {
  return ['admin', 'versions', versionId, 'apps', id] as const;
}

// Fetches a single app with counts — suspends until data is ready
export function useApp(versionId: string, id: string) {
  return useSuspenseQuery<App, AxiosError>({
    queryKey: appQueryKey(versionId, id),
    queryFn: () => getApp(versionId, id),
  });
}
