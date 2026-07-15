import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@vritti/quantum-ui/Sonner';
import { useCallback, useMemo } from 'react';
import type { OrgStructureResponse } from '@/schemas/cloud/org-structure';
import { ORG_STRUCTURE_QUERY_KEY } from './useOrgStructure';

type StructurePatch = (structure: OrgStructureResponse) => OrgStructureResponse;

// Optimistically patches the cached org structure around a mutation
export function useOptimisticStructure(orgId: string) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ORG_STRUCTURE_QUERY_KEY(orgId), [orgId]);

  return useCallback(
    (patch: StructurePatch, run: () => Promise<unknown>, errorMessage?: string) => {
      const previous = queryClient.getQueryData<OrgStructureResponse>(queryKey);
      queryClient.setQueryData<OrgStructureResponse>(queryKey, (old) => (old ? patch(old) : old));
      run()
        .then(() => queryClient.invalidateQueries({ queryKey }))
        .catch(() => {
          if (previous) queryClient.setQueryData(queryKey, previous);
          if (errorMessage) toast.error(errorMessage);
        });
    },
    [queryClient, queryKey],
  );
}
