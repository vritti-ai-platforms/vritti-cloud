import { FEATURE_PERMISSIONS_KEY, useUpdatePermission } from '@hooks/admin/versions/features/permissions';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Switch } from '@vritti/quantum-ui/Switch';
import { BusinessSelector } from '@vritti/quantum-ui/selects/business';
import { FeaturePermissionSelector } from '@vritti/quantum-ui/selects/feature-permission';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/context/VersionScopeContext';
import {
  type FeaturePermission,
  type PermissionFormData,
  permissionFormSchema,
} from '@/schemas/admin/feature-permissions';

interface EditPermissionFormProps {
  permission: FeaturePermission;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditPermissionForm: React.FC<EditPermissionFormProps> = ({ permission, onSuccess, onCancel }) => {
  const { versionId, featureId } = useVersionContext();
  const form = useForm<PermissionFormData>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      code: permission.code,
      label: permission.label,
      isGlobal: permission.isGlobal,
      businessIds: permission.businessIds,
      dependsOn: permission.dependsOn,
    },
  });

  const isGlobal = form.watch('isGlobal');

  const updateMutation = useUpdatePermission(FEATURE_PERMISSIONS_KEY(versionId, featureId), { onSuccess });

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
      <TextField
        name="code"
        label="Code"
        placeholder="e.g. add.salt"
        description="Lowercase, dot-separated (e.g. add.salt)"
      />
      <TextField name="label" label="Label" placeholder="e.g. Add Salt" />
      <Switch name="isGlobal" label="Global" description="Applies to all businesses" />
      {!isGlobal && <BusinessSelector name="businessIds" label="Businesses" placeholder="Select businesses" multiple />}
      <FeaturePermissionSelector
        name="dependsOn"
        label="Depends on"
        placeholder="Select prerequisite permissions"
        multiple
        params={{ versionId, featureId, excludeId: permission.id }}
      />
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
