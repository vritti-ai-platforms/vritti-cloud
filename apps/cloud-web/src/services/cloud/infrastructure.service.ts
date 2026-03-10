import { axios } from '@vritti/quantum-ui/axios';

export interface RegionOption {
  id: string;
  name: string;
  code: string;
  state: string;
  city: string;
}

export interface ProviderOption {
  id: string;
  name: string;
  code: string;
}

export interface DeploymentOption {
  id: string;
  name: string;
  type: 'shared' | 'dedicated';
}

export interface PlanOption {
  id: string;
  name: string;
  code: string;
  price: string | null;
  currency: string | null;
}

// Fetches all available regions
export function getRegions(): Promise<RegionOption[]> {
  return axios.get<RegionOption[]>('cloud-api/regions').then((r) => r.data);
}

// Fetches cloud providers available in a specific region
export function getRegionProviders(regionId: string): Promise<ProviderOption[]> {
  return axios.get<ProviderOption[]>(`cloud-api/regions/${regionId}/cloud-providers`).then((r) => r.data);
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
