import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RoleTemplateDetail } from '@/schemas/admin/role-templates';
import { getRoleTemplate } from '../../../services/admin/role-templates.service';

export function roleTemplateQueryKey(versionId: string, businessId: string, id: string) {
  return ['admin', 'versions', versionId, 'businesses', businessId, 'role-templates', id] as const;
}

// Suspense-fetches a single role template's detail
export function useRoleTemplate(versionId: string, businessId: string, id: string) {
  return useSuspenseQuery<RoleTemplateDetail, AxiosError>({
    queryKey: roleTemplateQueryKey(versionId, businessId, id),
    queryFn: () => getRoleTemplate(versionId, businessId, id),
  });
}
