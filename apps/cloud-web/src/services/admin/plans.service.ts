import { axios } from '@vritti/quantum-ui/axios';
import type { MutationResponse } from '@vritti/quantum-ui/api-response';
import type { TableViewState } from '@vritti/quantum-ui/table-filter';
import type { CreatePlanData, Plan, UpdatePlanData } from '@/schemas/admin/plans';

export interface PlansResponse {
  result: Plan[];
  count: number;
  state: TableViewState;
  activeViewId: string | null;
}

// Fetches plans for the data table — server applies filter/sort state
export function getPlans(): Promise<PlansResponse> {
  return axios.get<PlansResponse>('admin-api/plans/table').then((r) => r.data);
}

// Fetches a single plan by ID
export function getPlan(id: string): Promise<Plan> {
  return axios.get<Plan>(`admin-api/plans/${id}`).then((r) => r.data);
}

// Creates a new plan
export function createPlan(data: CreatePlanData): Promise<MutationResponse> {
  return axios.post<MutationResponse>('admin-api/plans', data).then((r) => r.data);
}

// Updates an existing plan by ID
export function updatePlan({ id, data }: { id: string; data: UpdatePlanData }): Promise<MutationResponse> {
  return axios.patch<MutationResponse>(`admin-api/plans/${id}`, data).then((r) => r.data);
}

// Deletes a plan by ID
export function deletePlan(id: string): Promise<void> {
  return axios.delete(`admin-api/plans/${id}`).then(() => undefined);
}
