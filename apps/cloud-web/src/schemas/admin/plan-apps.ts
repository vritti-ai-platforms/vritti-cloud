import type { TableResponse } from '@vritti/quantum-ui/api-response';
import { z } from 'zod';

export interface PlanApp {
  appId: string;
  appCode: string;
  appName: string;
  includedFeatureCodes: string[];
  createdAt: string;
}

export interface PlanAppTableRow {
  appCode: string;
  includedFeatureCodes: string[] | null;
  sortOrder: number;
}

export type PlanAppsTableResponse = TableResponse<PlanAppTableRow>;

export const assignPlanAppSchema = z.object({
  appCode: z.string().min(1, 'Please select an app'),
  includedFeatureCodes: z.array(z.string()).optional(),
});

export const updatePlanAppSchema = z.object({
  includedFeatureCodes: z.array(z.string()).nullable().optional(),
});

export type AssignPlanAppData = z.infer<typeof assignPlanAppSchema>;
export type UpdatePlanAppData = z.infer<typeof updatePlanAppSchema>;
