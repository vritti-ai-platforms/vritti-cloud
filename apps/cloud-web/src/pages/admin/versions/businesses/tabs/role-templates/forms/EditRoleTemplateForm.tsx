import { useUpdateRoleTemplate } from '@hooks/admin/versions/businesses/role-templates';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { AppSelector } from '@vritti/quantum-ui/selects/app';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { RoleTemplateDetail } from '@/schemas/admin/role-templates';
import { type UpdateRoleTemplateData, updateRoleTemplateSchema } from '@/schemas/admin/role-templates';

interface EditRoleTemplateFormProps {
  role: RoleTemplateDetail;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditRoleTemplateForm: React.FC<EditRoleTemplateFormProps> = ({ role, onSuccess, onCancel }) => {
  const { versionId } = useVersionContext();

  const form = useForm<UpdateRoleTemplateData>({
    resolver: zodResolver(updateRoleTemplateSchema),
    defaultValues: {
      name: role.name,
      description: role.description ?? '',
      scope: role.scope,
      appIds: role.appIds,
    },
  });

  const updateMutation = useUpdateRoleTemplate(versionId, role.businessId, { onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({ id: role.id, data })}
    >
      <TextField name="name" label="Role Name" placeholder="e.g. Sales Manager" />
      <TextField name="description" label="Description" placeholder="Optional description" />
      <Select
        name="scope"
        label="Scope"
        placeholder="Select scope"
        options={[
          { value: 'GLOBAL', label: 'Global' },
          { value: 'SUBTREE', label: 'Subtree' },
          { value: 'SINGLE_BU', label: 'Single Business Unit' },
        ]}
      />
      <AppSelector
        name="appIds"
        multiple
        label="Apps"
        placeholder="Select apps this role covers"
        params={{ versionId, businessId: role.businessId }}
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
