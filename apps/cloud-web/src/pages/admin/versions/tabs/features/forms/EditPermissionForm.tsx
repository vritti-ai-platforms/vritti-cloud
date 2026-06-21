import { FEATURE_PERMISSIONS_TABLE_KEY, useUpdatePermission } from '@hooks/admin/versions/features/permissions';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Switch } from '@vritti/quantum-ui/Switch';
import { BusinessSelector } from '@vritti/quantum-ui/selects/business';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import {
  type FeaturePermission,
  type PermissionFormData,
  permissionFormSchema,
} from '@/schemas/admin/feature-permissions';

interface EditPermissionFormProps {
  versionId: string;
  featureId: string;
  permission: FeaturePermission;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditPermissionForm: React.FC<EditPermissionFormProps> = ({
  versionId,
  featureId,
  permission,
  onSuccess,
  onCancel,
}) => {
  const form = useForm<PermissionFormData>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      code: permission.code,
      label: permission.label,
      isGlobal: permission.isGlobal,
      businessIds: permission.businessIds,
    },
  });

  const isGlobal = form.watch('isGlobal');

  const updateMutation = useUpdatePermission(FEATURE_PERMISSIONS_TABLE_KEY(versionId, featureId), { onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({
        versionId,
        permissionId: permission.id,
        data: { ...data, businessIds: data.isGlobal ? [] : data.businessIds },
      })}
    >
      <TextField name="code" label="Code" placeholder="e.g. add_salt" description="Lowercase slug (- _ : . allowed)" />
      <TextField name="label" label="Label" placeholder="e.g. Add Salt" />
      <Switch name="isGlobal" label="Global" description="Applies to all businesses" />
      {!isGlobal && <BusinessSelector name="businessIds" label="Businesses" placeholder="Select businesses" multiple />}
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </DialogActions>
    </Form>
  );
};
