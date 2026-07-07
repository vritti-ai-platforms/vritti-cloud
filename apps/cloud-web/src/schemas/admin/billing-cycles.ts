import type { TableResponse } from '@vritti/quantum-ui/types/api-response';
import { z } from '@vritti/quantum-ui/zod';

export interface BillingCycle {
  id: string;
  name: string;
  days: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export type BillingCyclesTableResponse = TableResponse<BillingCycle>;

export const createBillingCycleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
  days: z.number().int('Days must be a whole number').min(1, 'Days must be at least 1'),
  sortOrder: z.number().int('Sort order must be a whole number').optional(),
  isActive: z.boolean().optional(),
});

export const updateBillingCycleSchema = createBillingCycleSchema.partial();

export type CreateBillingCycleData = z.infer<typeof createBillingCycleSchema>;
export type UpdateBillingCycleData = z.infer<typeof updateBillingCycleSchema>;
