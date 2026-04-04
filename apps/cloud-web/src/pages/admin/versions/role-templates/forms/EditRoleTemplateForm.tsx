import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateRoleTemplate } from '@hooks/admin/role-templates';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { IndustrySelector } from '@vritti/quantum-ui/selects/industry';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
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
      industryId: role.industryId,
    },
  });

  const updateMutation = useUpdateRoleTemplate(versionId, { onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      showRootError
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
      <IndustrySelector name="industryId" label="Industry" placeholder="Select industry" />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </div>
    </Form>
  );
};
