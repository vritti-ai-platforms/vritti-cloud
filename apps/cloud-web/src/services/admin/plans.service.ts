import { axios } from '@vritti/quantum-ui/axios';
import type { CreatePlanData, Plan, UpdatePlanData } from '@/schemas/admin/plans';

export interface PlansResponse {
  result: Plan[];
  count: number;
}

// Fetches all plans
export function getPlans(): Promise<PlansResponse> {
  return axios.get<PlansResponse>('admin-api/plans').then((r) => r.data);
}

// Fetches a single plan by ID
export function getPlan(id: string): Promise<Plan> {
  return axios.get<Plan>(`admin-api/plans/${id}`).then((r) => r.data);
}

// Creates a new plan
export function createPlan(data: CreatePlanData): Promise<Plan> {
  return axios.post<Plan>('admin-api/plans', data).then((r) => r.data);
}

// Updates an existing plan by ID
export function updatePlan({ id, data }: { id: string; data: UpdatePlanData }): Promise<Plan> {
  return axios.patch<Plan>(`admin-api/plans/${id}`, data).then((r) => r.data);
}

// Deletes a plan by ID
export function deletePlan(id: string): Promise<void> {
  return axios.delete(`admin-api/plans/${id}`).then(() => undefined);
}
