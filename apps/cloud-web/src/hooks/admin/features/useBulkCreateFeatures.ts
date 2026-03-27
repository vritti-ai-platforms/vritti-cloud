import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import { bulkCreateFeatures } from '@/services/admin/features.service';
import { FEATURES_QUERY_KEY } from './useFeatures';

// Bulk creates features from validated rows and invalidates the table
export function useBulkCreateFeatures(versionId: string) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Record<string, string>[]>({
    mutationFn: (rows) => bulkCreateFeatures(versionId, rows),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEATURES_QUERY_KEY(versionId) });
    },
  });
}
