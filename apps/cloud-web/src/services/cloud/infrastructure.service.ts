import { axios } from '@vritti/quantum-ui/axios';

export interface DeploymentOption {
  id: string;
  name: string;
  type: 'shared' | 'dedicated';
}

export interface PlanOption {
  id: string;
  name: string;
  code: string;
  content: string | null;
  price: string | null;
  currency: string | null;
}

// Fetches active deployments filtered by region, provider, and industry
export function getDeployments(params: {
  regionId: string;
  cloudProviderId: string;
  industryId: string;
}): Promise<DeploymentOption[]> {
  return axios.get<DeploymentOption[]>('cloud-api/deployments', { params }).then((r) => r.data);
}

// Fetches plans for a deployment+industry combo with pricing
export function getDeploymentPlans(deploymentId: string, industryId: string): Promise<PlanOption[]> {
  return axios
    .get<PlanOption[]>(`cloud-api/deployments/${deploymentId}/plans`, { params: { industryId } })
    .then((r) => r.data);
}
