import type { TableViewState } from '@vritti/quantum-ui/types/table-filter';
import { z, zodCodeField } from '@vritti/quantum-ui/zod';

export interface RegionProvider {
  id: string;
  name: string;
  code: string;
  logoUrl: string;
  logoDarkUrl: string | null;
  isAssigned: boolean;
  deploymentCount?: number;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  country: string;
  state: string;
  city: string;
  isActive: boolean;
  providerCount: number;
  deploymentCount: number;
  priceCount: number;
  canDelete: boolean;
  providers: RegionProvider[];
  createdAt: string;
  updatedAt: string | null;
}

export interface RegionsResponse {
  result: Region[];
  state: TableViewState;
  activeViewId: string | null;
}

export const createRegionSchema = z.object({
  name: z.string().min(1, 'Region name is required'),
  code: zodCodeField({ max: 100 }),
  country: z.string().min(1, 'Country is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  city: z.string().min(1, 'City is required').max(100),
  isActive: z.boolean().optional(),
});

export const updateRegionSchema = createRegionSchema.partial();

export type CreateRegionData = z.infer<typeof createRegionSchema>;
export type UpdateRegionData = z.infer<typeof updateRegionSchema>;
