import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateRole } from '@hooks/admin/roles';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { AppSelector } from '@vritti/quantum-ui/selects/app';
import { IndustrySelector } from '@vritti/quantum-ui/selects/industry';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/hooks/admin/app-versions/useVersionContext';
import { type CreateRoleData, createRoleSchema } from '@/schemas/admin/roles';

interface AddRoleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddRoleForm: React.FC<AddRoleFormProps> = ({ onSuccess, onCancel }) => {
  const { versionId } = useVersionContext();

  const form = useForm<CreateRoleData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: '',
      description: '',
      scope: 'GLOBAL',
      industryId: '',
      appIds: [],
      appVersionId: versionId ?? '',
    },
  });

  const createMutation = useCreateRole(versionId, { onSuccess });

  return (
    <Form form={form} mutation={createMutation} showRootError resetOnSuccess onCancel={onCancel}>
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
      <AppSelector name="appIds" multiple label="Apps" placeholder="Select apps this role covers" />
      <IndustrySelector name="industryId" label="Industry" placeholder="All industries (optional)" />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Role
        </Button>
      </div>
    </Form>
  );
};
