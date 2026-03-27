import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import { bulkCreateApps } from '@/services/admin/apps.service';
import { APPS_QUERY_KEY } from './useApps';

// Bulk creates apps from validated rows and invalidates the table
export function useBulkCreateApps(versionId: string) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Record<string, string>[]>({
    mutationFn: (rows) => bulkCreateApps(versionId, rows),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPS_QUERY_KEY(versionId) });
    },
  });
}
