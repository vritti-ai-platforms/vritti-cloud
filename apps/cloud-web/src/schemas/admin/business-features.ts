import type { TableResponse } from '@vritti/quantum-ui/api-response';
import { z } from '@vritti/quantum-ui/zod';

export interface BusinessFeaturePermission {
  id: string;
  code: string;
  label: string;
  isGlobal: boolean;
}

export interface BusinessFeatureApp {
  id: string;
  name: string;
}

export interface BusinessFeature {
  id: string;
  code: string;
  name: string;
  icon: string;
  apps: BusinessFeatureApp[];
  permissionCount: number;
}

export type BusinessFeaturesTableResponse = TableResponse<BusinessFeature>;

export const setFeatureAppsSchema = z.object({
  appIds: z.array(z.string().uuid()),
});

export type SetFeatureAppsData = z.infer<typeof setFeatureAppsSchema>;

export const addBusinessFeatureSchema = z.object({
  featureId: z.string().uuid('Please select a feature'),
  appIds: z.array(z.string().uuid()).min(1, 'Select at least one app'),
});

export type AddBusinessFeatureData = z.infer<typeof addBusinessFeatureSchema>;
