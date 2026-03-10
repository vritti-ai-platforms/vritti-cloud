import type { TableViewState } from '@vritti/quantum-ui/table-filter';
import { z } from 'zod';

export interface Industry {
  id: string;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
  canDelete: boolean;
}

export interface IndustriesResponse {
  result: Industry[];
  count: number;
  state: TableViewState;
  activeViewId: string | null;
}

export const createIndustrySchema = z.object({
  name: z.string().min(1, 'Industry name is required'),
  code: z.string().min(1, 'Industry code is required').max(100, 'Code must be 100 characters or less'),
  description: z.string().optional(),
});

export type CreateIndustryData = z.infer<typeof createIndustrySchema>;

export const updateIndustrySchema = z.object({
  name: z.string().min(1, 'Industry name is required'),
  code: z.string().min(1, 'Industry code is required').max(100, 'Code must be 100 characters or less'),
  description: z.string().optional(),
});

export type UpdateIndustryData = z.infer<typeof updateIndustrySchema>;
