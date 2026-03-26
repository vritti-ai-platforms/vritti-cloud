import type { TableResponse } from '@vritti/quantum-ui/api-response';
import { z } from 'zod';

export interface Industry {
  id: string;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
  canDelete: boolean;
  recommendedApps: string[];
}

export type IndustriesResponse = TableResponse<Industry>;

export const createIndustrySchema = z.object({
  name: z.string().min(1, 'Industry name is required'),
  code: z.string().min(1, 'Industry code is required').max(100, 'Code must be 100 characters or less'),
  description: z.string().optional(),
  recommendedApps: z.array(z.string()).optional(),
});

export type CreateIndustryData = z.infer<typeof createIndustrySchema>;

export const updateIndustrySchema = z.object({
  name: z.string().min(1, 'Industry name is required'),
  code: z.string().min(1, 'Industry code is required').max(100, 'Code must be 100 characters or less'),
  description: z.string().optional(),
  recommendedApps: z.array(z.string()).optional(),
});

export type UpdateIndustryData = z.infer<typeof updateIndustrySchema>;
