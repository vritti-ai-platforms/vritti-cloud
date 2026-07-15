import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { type RoleScopeSection, type RoleTemplate, sectionTemplates } from '@/schemas/cloud/roles';
import { getRoles } from '../../../services/cloud/roles.service';
import { ROLES_QUERY_KEY } from './useRoles';

type UseRoleTemplatesOptions = Omit<
  UseQueryOptions<RoleScopeSection[], AxiosError, RoleTemplate[]>,
  'queryKey' | 'queryFn' | 'select'
>;

// Selects the flat template list from the shared role-sections query — no extra request
export function useRoleTemplates(orgId: string, options?: UseRoleTemplatesOptions) {
  return useQuery<RoleScopeSection[], AxiosError, RoleTemplate[]>({
    queryKey: ROLES_QUERY_KEY(orgId),
    queryFn: () => getRoles(orgId),
    enabled: !!orgId,
    select: sectionTemplates,
    ...options,
  });
}
