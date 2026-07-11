import { useUpdateRoleTemplate } from '@hooks/admin/versions/businesses/role-templates';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { RadioGroup } from '@vritti/quantum-ui/RadioGroup';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { RoleTemplateDetail } from '@/schemas/admin/role-templates';
import {
  SITE_TYPE_OPTIONS,
  type UpdateRoleTemplateData,
  type UpdateRoleTemplateInput,
  updateRoleTemplateSchema,
} from '@/schemas/admin/role-templates';

interface EditRoleTemplateFormProps {
  role: RoleTemplateDetail;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditRoleTemplateForm: React.FC<EditRoleTemplateFormProps> = ({ role, onSuccess, onCancel }) => {
  const { versionId } = useVersionContext();

  const form = useForm<UpdateRoleTemplateInput, unknown, UpdateRoleTemplateData>({
    resolver: zodResolver(updateRoleTemplateSchema),
    defaultValues: {
      name: role.name,
      description: role.description ?? '',
      siteType: role.siteType ?? 'OUTLET',
    },
  });

  const updateMutation = useUpdateRoleTemplate(versionId, role.businessId, { onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({
        id: role.id,
        data: role.scope === 'SITE' ? data : { name: data.name, description: data.description },
      })}
    >
      <TextField name="name" label="Role Name" placeholder="e.g. Sales Manager" />
      {role.scope === 'SITE' && (
        <RadioGroup name="siteType" label="Site Type" orientation="horizontal" options={SITE_TYPE_OPTIONS} />
      )}
      <TextField name="description" label="Description" placeholder="Optional description" />
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
