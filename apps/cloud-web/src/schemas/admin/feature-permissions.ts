import type { TableResponse } from '@vritti/quantum-ui/types/api-response';
import { z } from '@vritti/quantum-ui/zod';

export interface FeaturePermission {
  id: string;
  featureId: string;
  featureName: string;
  code: string;
  label: string;
  isGlobal: boolean;
  businessIds: string[];
  sortOrder: number;
}

export type FeaturePermissionsTableResponse = TableResponse<FeaturePermission>;

// Business-wise usage of a permission — powers the delete-impact dialog
export interface PermissionUsageRef {
  id: string;
  name: string;
}

export interface PermissionUsageBusiness {
  businessId: string;
  businessName: string;
  plans: PermissionUsageRef[];
  roleTemplates: PermissionUsageRef[];
}

export interface PermissionUsage {
  businesses: PermissionUsageBusiness[];
  planCount: number;
  roleTemplateCount: number;
}

const codeField = z
  .string()
  .min(1, 'Code is required')
  .regex(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/, 'Code must be dot-separated lowercase (e.g. add.salt)');

const labelField = z.string().min(1, 'Label is required');

export const createPermissionSchema = z
  .object({
    featureId: z.string().min(1, 'Please select a feature'),
    code: codeField,
    label: labelField,
    isGlobal: z.boolean(),
    businessIds: z.array(z.string()),
  })
  .refine((data) => data.isGlobal || data.businessIds.length > 0, {
    message: 'Select at least one business',
    path: ['businessIds'],
  });

export type CreatePermissionData = z.infer<typeof createPermissionSchema>;

export const updatePermissionSchema = z
  .object({
    code: codeField,
    label: labelField,
    isGlobal: z.boolean(),
    businessIds: z.array(z.string()),
  })
  .refine((data) => data.isGlobal || data.businessIds.length > 0, {
    message: 'Select at least one business',
    path: ['businessIds'],
  });

export type UpdatePermissionData = z.infer<typeof updatePermissionSchema>;

// Feature-tab form input — featureId is injected from page context, not entered by the user
export const permissionFormSchema = z
  .object({
    code: codeField,
    label: labelField,
    isGlobal: z.boolean(),
    businessIds: z.array(z.string()),
  })
  .refine((data) => data.isGlobal || data.businessIds.length > 0, {
    message: 'Select at least one business',
    path: ['businessIds'],
  });

export type PermissionFormData = z.infer<typeof permissionFormSchema>;
