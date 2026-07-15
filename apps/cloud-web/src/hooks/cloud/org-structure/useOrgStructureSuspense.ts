import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { OrgStructureResponse } from '@/schemas/cloud/org-structure';
import { getOrgStructure } from '@/services/cloud/org-structure.service';
import { ORG_STRUCTURE_QUERY_KEY } from './useOrgStructure';

// Fetches the organization's full structure, suspending until ready
export function useOrgStructureSuspense(orgId: string) {
  return useSuspenseQuery<OrgStructureResponse, AxiosError>({
    queryKey: ORG_STRUCTURE_QUERY_KEY(orgId),
    queryFn: () => getOrgStructure(orgId),
  });
}
