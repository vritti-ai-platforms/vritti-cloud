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
  lucideIcon: string;
  app: BusinessFeatureApp;
  permissionCount: number;
}

export type BusinessFeaturesTableResponse = TableResponse<BusinessFeature>;

// A feature pins to a single app within a business; appId null removes it from the business
export const setFeatureAppSchema = z.object({
  appId: z.string().uuid('Select an app'),
});

export type SetFeatureAppData = z.infer<typeof setFeatureAppSchema>;

export const addBusinessFeatureSchema = z.object({
  featureIds: z.array(z.string().uuid()).min(1, 'Select at least one feature'),
  appId: z.string().uuid('Select an app'),
});

export type AddBusinessFeatureData = z.infer<typeof addBusinessFeatureSchema>;
