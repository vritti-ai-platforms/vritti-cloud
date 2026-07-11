import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { OrgStructureResponse } from '@/schemas/cloud/org-structure';
import { getOrgStructure } from '@/services/cloud/org-structure.service';

export const ORG_STRUCTURE_QUERY_KEY = (orgId: string) => ['organizations', orgId, 'structure'] as const;

type UseOrgStructureOptions = Omit<UseQueryOptions<OrgStructureResponse, AxiosError>, 'queryKey' | 'queryFn'>;

// Fetches the organization's full structure
export function useOrgStructure(orgId: string, options?: UseOrgStructureOptions) {
  return useQuery<OrgStructureResponse, AxiosError>({
    queryKey: ORG_STRUCTURE_QUERY_KEY(orgId),
    queryFn: () => getOrgStructure(orgId),
    enabled: !!orgId,
    ...options,
  });
}
