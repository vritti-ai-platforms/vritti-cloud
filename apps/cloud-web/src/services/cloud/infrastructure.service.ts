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

// Fetches active deployments filtered by region, provider, and business
export function getDeployments(params: {
  regionId: string;
  cloudProviderId: string;
  businessId: string;
}): Promise<DeploymentOption[]> {
  return axios.get<DeploymentOption[]>('cloud-api/deployments', { params }).then((r) => r.data);
}

// Fetches plans for a deployment+business combo with pricing
export function getDeploymentPlans(deploymentId: string, businessId: string): Promise<PlanOption[]> {
  return axios
    .get<PlanOption[]>(`cloud-api/deployments/${deploymentId}/plans`, { params: { businessId } })
    .then((r) => r.data);
}
