import { axios } from '@vritti/quantum-ui/axios';
import type { MutationResponse } from '@vritti/quantum-ui/api-response';
import type {
  AssignPlanData,
  CreateDeploymentData,
  Deployment,
  DeploymentPlanAssignment,
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
export function createDeployment(data: CreateDeploymentData): Promise<MutationResponse> {
  return axios.post<MutationResponse>('admin-api/deployments', data).then((r) => r.data);
}

// Updates an existing deployment by ID
export function updateDeployment({ id, data }: { id: string; data: UpdateDeploymentData }): Promise<MutationResponse> {
  return axios.patch<MutationResponse>(`admin-api/deployments/${id}`, data).then((r) => r.data);
}

// Deletes a deployment by ID
export function deleteDeployment(id: string): Promise<void> {
  return axios.delete(`admin-api/deployments/${id}`).then(() => undefined);
}

// Assigns a plan+industry combo to a deployment
export function assignDeploymentPlan({
  id,
  data,
}: {
  id: string;
  data: AssignPlanData;
}): Promise<MutationResponse> {
  return axios.post<MutationResponse>(`admin-api/deployments/${id}/plans`, data).then((r) => r.data);
}

// Removes a plan+industry assignment from a deployment
export function removeDeploymentPlan({ id, data }: { id: string; data: AssignPlanData }): Promise<MutationResponse> {
  return axios.delete<MutationResponse>(`admin-api/deployments/${id}/plans`, { data }).then((r) => r.data);
}

// Fetches all plan+industry combos with assignment status for a deployment
export function getDeploymentPlanAssignments(deploymentId: string): Promise<DeploymentPlanAssignment[]> {
  return axios
    .get<DeploymentPlanAssignment[]>(`admin-api/deployments/${deploymentId}/plan-assignments`)
    .then((r) => r.data);
}
