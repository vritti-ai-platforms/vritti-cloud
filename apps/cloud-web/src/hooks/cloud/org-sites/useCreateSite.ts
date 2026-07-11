import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { CreateSiteData, Site } from '@/schemas/cloud/org-sites';
import { createOrgSite } from '@/services/cloud/org-sites.service';
import { ORG_STRUCTURE_QUERY_KEY } from '../org-structure/useOrgStructure';
import { ORG_SITES_QUERY_KEY } from './useOrgSites';

type CreateSiteVars = { orgId: string; data: CreateSiteData };
type UseCreateSiteOptions = Omit<UseMutationOptions<CreateResponse<Site>, AxiosError, CreateSiteVars>, 'mutationFn'>;

// Creates a new site and invalidates the site list
export function useCreateSite(options?: UseCreateSiteOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<Site>, AxiosError, CreateSiteVars>({
    ...options,
    mutationFn: createOrgSite,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_SITES_QUERY_KEY(vars.orgId) });
      queryClient.invalidateQueries({ queryKey: ORG_STRUCTURE_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
