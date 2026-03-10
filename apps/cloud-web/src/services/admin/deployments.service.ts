import { axios } from '@vritti/quantum-ui/axios';
import type {
  AssignPlanData,
  CreateDeploymentData,
  Deployment,
  DeploymentPlanListItem,
  DeploymentPlanPrice,
  UpdateDeploymentData,
} from '@/schemas/admin/deployments';

export interface DeploymentsResponse {
  result: Deployment[];
  count: number;
}

// Fetches all deployments with region and provider names
export function getDeployments(): Promise<DeploymentsResponse> {
  return axios.get<DeploymentsResponse>('admin-api/deployments').then((r) => r.data);
}

// Fetches a single deployment by ID
export function getDeployment(id: string): Promise<Deployment> {
  return axios.get<Deployment>(`admin-api/deployments/${id}`).then((r) => r.data);
}

// Creates a new deployment
export function createDeployment(data: CreateDeploymentData): Promise<Deployment> {
  return axios.post<Deployment>('admin-api/deployments', data).then((r) => r.data);
}

// Updates an existing deployment by ID
export function updateDeployment({ id, data }: { id: string; data: UpdateDeploymentData }): Promise<Deployment> {
  return axios.patch<Deployment>(`admin-api/deployments/${id}`, data).then((r) => r.data);
}

// Deletes a deployment by ID
export function deleteDeployment(id: string): Promise<void> {
  return axios.delete(`admin-api/deployments/${id}`).then(() => undefined);
}

// Fetches plan+industry assignments for a deployment
export function getDeploymentPlans(deploymentId: string): Promise<DeploymentPlanListItem[]> {
  return axios.get<DeploymentPlanListItem[]>(`admin-api/deployments/${deploymentId}/plans`).then((r) => r.data);
}

// Fetches plan+industry assignments with prices for a deployment
export function getDeploymentPlanPrices(deploymentId: string): Promise<DeploymentPlanPrice[]> {
  return axios.get<DeploymentPlanPrice[]>(`admin-api/deployments/${deploymentId}/plan-prices`).then((r) => r.data);
}

// Assigns a plan+industry combo to a deployment
export function assignDeploymentPlan({
  id,
  data,
}: {
  id: string;
  data: AssignPlanData;
}): Promise<{ assigned: number }> {
  return axios.post<{ assigned: number }>(`admin-api/deployments/${id}/plans`, data).then((r) => r.data);
}

// Removes a plan+industry assignment from a deployment
export function removeDeploymentPlan({ id, data }: { id: string; data: AssignPlanData }): Promise<void> {
  return axios.delete(`admin-api/deployments/${id}/plans`, { data }).then(() => undefined);
}
