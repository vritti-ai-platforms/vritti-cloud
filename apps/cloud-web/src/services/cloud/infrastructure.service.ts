import { axios } from '@vritti/quantum-ui/axios';

export interface PlanOption {
  id: string;
  name: string;
  code: string;
  content: string | null;
  amount: number | null;
  currency: string | null;
}

// Fetches plans for a deployment+business combo, priced for the given country
export function getDeploymentPlans(deploymentId: string, businessId: string, countryId: string): Promise<PlanOption[]> {
  return axios
    .get<PlanOption[]>(`cloud-api/deployments/${deploymentId}/plans`, { params: { businessId, countryId } })
    .then((r) => r.data);
}
