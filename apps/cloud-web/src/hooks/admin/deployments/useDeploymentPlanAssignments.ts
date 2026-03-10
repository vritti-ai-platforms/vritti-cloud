import type { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import type { DeploymentPlanAssignment } from '@/schemas/admin/deployments';
import { getDeploymentPlanAssignments } from '../../../services/admin/deployments.service';

export const DEPLOYMENT_PLAN_ASSIGNMENTS_QUERY_KEY = (id: string) =>
  ['admin', 'deployments', id, 'plan-assignments'] as const;

// Fetches all plan+industry combos with isAssigned status for a deployment
export function useDeploymentPlanAssignments(deploymentId: string) {
  return useQuery<DeploymentPlanAssignment[], AxiosError>({
    queryKey: DEPLOYMENT_PLAN_ASSIGNMENTS_QUERY_KEY(deploymentId),
    queryFn: () => getDeploymentPlanAssignments(deploymentId),
    enabled: !!deploymentId,
  });
}
