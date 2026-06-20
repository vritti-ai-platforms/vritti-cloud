import type { TableResponse } from '@vritti/quantum-ui/api-response';
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

const codeField = z
  .string()
  .min(1, 'Code is required')
  .regex(/^[a-z0-9]+(?:[-_:.][a-z0-9]+)*$/, 'Use lowercase letters, numbers and - _ : . only');

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
