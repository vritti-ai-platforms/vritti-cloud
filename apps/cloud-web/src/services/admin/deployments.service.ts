import { axios } from '@vritti/quantum-ui/axios';
import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type {
  CreateDeploymentData,
  Deployment,
  DeploymentSigningKey,
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
export function createDeployment(data: CreateDeploymentData): Promise<CreateResponse<Deployment>> {
  return axios.post<CreateResponse<Deployment>>('admin-api/deployments', data).then((r) => r.data);
}

// Updates an existing deployment by ID
export function updateDeployment({ id, data }: { id: string; data: UpdateDeploymentData }): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`admin-api/deployments/${id}`, data).then((r) => r.data);
}

// Regenerates a deployment's signing keypair and returns the new public key (one-time reveal)
export function regenerateSigningKey(id: string): Promise<CreateResponse<DeploymentSigningKey>> {
  return axios
    .post<CreateResponse<DeploymentSigningKey>>(`admin-api/deployments/${id}/signing-key`)
    .then((r) => r.data);
}

// Deletes a deployment by ID
export function deleteDeployment(id: string): Promise<void> {
  return axios.delete(`admin-api/deployments/${id}`).then(() => undefined);
}
