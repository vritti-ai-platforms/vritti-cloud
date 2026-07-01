import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RoleTemplate } from '@/schemas/cloud/roles';
import { getRoleTemplates } from '../../../services/cloud/roles.service';

const ROLE_TEMPLATES_QUERY_KEY = (orgId: string) => ['organizations', orgId, 'role-templates'] as const;

type UseRoleTemplatesOptions = Omit<UseQueryOptions<RoleTemplate[], AxiosError>, 'queryKey' | 'queryFn'>;

// Fetches available role templates for the organization
export function useRoleTemplates(orgId: string, options?: UseRoleTemplatesOptions) {
  return useQuery<RoleTemplate[], AxiosError>({
    queryKey: ROLE_TEMPLATES_QUERY_KEY(orgId),
    queryFn: () => getRoleTemplates(orgId),
    enabled: !!orgId,
    ...options,
  });
}
