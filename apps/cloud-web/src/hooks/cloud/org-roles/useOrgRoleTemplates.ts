import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RoleTemplate } from '@/schemas/cloud/org-roles';
import { getOrgRoleTemplates } from '../../../services/cloud/org-roles.service';

export const ORG_ROLE_TEMPLATES_QUERY_KEY = (orgId: string) =>
  ['organizations', orgId, 'role-templates'] as const;

type UseOrgRoleTemplatesOptions = Omit<
  UseQueryOptions<RoleTemplate[], AxiosError>,
  'queryKey' | 'queryFn'
>;

// Fetches available role templates for the organization
export function useOrgRoleTemplates(orgId: string, options?: UseOrgRoleTemplatesOptions) {
  return useQuery<RoleTemplate[], AxiosError>({
    queryKey: ORG_ROLE_TEMPLATES_QUERY_KEY(orgId),
    queryFn: () => getOrgRoleTemplates(orgId),
    enabled: !!orgId,
    ...options,
  });
}
