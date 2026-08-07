import { axios } from '@vritti/quantum-ui/axios';
import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type {
  AgentStatus,
  CreateDeploymentData,
  Deployment,
  DeploymentEventsResponse,
  DeploymentSigningKey,
  EnrollToken,
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

// Re-pushes the signed feature/permission catalog snapshot to this deployment's core
export function syncDeploymentCatalog(deploymentId: string): Promise<SuccessResponse> {
  return axios
    .post<SuccessResponse>(`admin-api/deployments/${deploymentId}/sync-catalog`, undefined, {
      showSuccessToast: false,
    })
    .then((r) => r.data);
}

// Issues a one-time agent enroll token and ensures the deployment's agent keypair exists
export function issueEnrollToken(id: string): Promise<CreateResponse<EnrollToken>> {
  return axios.post<CreateResponse<EnrollToken>>(`admin-api/deployments/${id}/agent/enroll-token`).then((r) => r.data);
}

// Asks the connected agent to reconcile immediately (clears backoff) instead of waiting on the resync
export function forceRecheckAgent(id: string): Promise<SuccessResponse> {
  return axios
    .post<SuccessResponse>(`admin-api/deployments/${id}/agent/recheck`, undefined, { showSuccessToast: false })
    .then((r) => r.data);
}

// Recreates one service's container on the connected agent so it picks up the latest env from Infisical
export function recreateService({ id, service }: { id: string; service: string }): Promise<SuccessResponse> {
  return axios
    .post<SuccessResponse>(`admin-api/deployments/${id}/agent/services/${service}/recreate`)
    .then((r) => r.data);
}

// Takes the whole managed deployment offline — the agent tears the stack down; the VM data persists
export function stopDeployment(id: string): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>(`admin-api/deployments/${id}/stop`).then((r) => r.data);
}

// Brings a stopped managed deployment back online — the agent reconciles the full stack back up
export function startDeployment(id: string): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>(`admin-api/deployments/${id}/start`).then((r) => r.data);
}

// Asks the connected agent to take an on-demand pgBackRest backup now (type = full | diff | incr)
export function runBackup({ id, type }: { id: string; type: string }): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>(`admin-api/deployments/${id}/agent/backup/${type}`).then((r) => r.data);
}

// DESTRUCTIVE: restores the managed database to a point in time, a specific backup, or the latest
export function restoreDatabase({
  id,
  targetTime,
  setLabel,
}: {
  id: string;
  targetTime?: string;
  setLabel?: string;
}): Promise<SuccessResponse> {
  return axios
    .post<SuccessResponse>(`admin-api/deployments/${id}/agent/restore`, { targetTime, setLabel })
    .then((r) => r.data);
}

// Fetches the live agent connection and reconciliation status for a deployment
export function getAgentStatus(id: string): Promise<AgentStatus> {
  return axios.get<AgentStatus>(`admin-api/deployments/${id}/agent`).then((r) => r.data);
}

// Fetches a newest-first, cursor-paginated page of the deployment's activity timeline
export function getDeploymentActivity(id: string, cursor?: string): Promise<DeploymentEventsResponse> {
  return axios
    .get<DeploymentEventsResponse>(`admin-api/deployments/${id}/activity`, {
      params: cursor ? { cursor } : undefined,
    })
    .then((r) => r.data);
}

// Deletes a deployment by ID
export function deleteDeployment(id: string): Promise<void> {
  return axios.delete(`admin-api/deployments/${id}`).then(() => undefined);
}
