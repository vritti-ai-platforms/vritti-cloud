import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { AdminOrganizationDetail } from '@/schemas/admin/organizations';
import { getOrganization } from '../../../services/admin/organizations.service';

// Fetches a single organization by ID — suspends until data is ready
export function useOrganization(id: string) {
  return useSuspenseQuery<AdminOrganizationDetail, AxiosError>({
    queryKey: ['admin', 'organizations', id],
    queryFn: () => getOrganization(id),
  });
}
