import { axios } from '@vritti/quantum-ui/axios';

export interface PlanOption {
  id: string;
  name: string;
  code: string;
  content: string | null;
  price: string | null;
  currency: string | null;
}

// Fetches plans for a deployment+business combo with pricing
export function getDeploymentPlans(deploymentId: string, businessId: string): Promise<PlanOption[]> {
  return axios
    .get<PlanOption[]>(`cloud-api/deployments/${deploymentId}/plans`, { params: { businessId } })
    .then((r) => r.data);
}
