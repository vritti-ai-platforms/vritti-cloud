import { useCreateRole, useRoleTemplates } from '@hooks/cloud/roles';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type CreateRoleFormData, createRoleSchema, type Role } from '@/schemas/cloud/roles';

interface AddRoleFormProps {
  orgId: string;
  onCreated: (role: Role) => void;
  onCancel: () => void;
}

// Create-role dialog — every role builds on a template, then permissions are customized on the role's view page.
export const AddRoleForm: React.FC<AddRoleFormProps> = ({ orgId, onCreated, onCancel }) => {
  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { code: '', name: '', description: '', features: {} },
  });
  const { data: templates = [] } = useRoleTemplates(orgId);
  const createMutation = useCreateRole({ onSuccess: (res) => onCreated(res.data) });

  const baseOptions = templates.map((t) => ({ value: t.code, label: t.name }));

  return (
    <Form form={form} mutation={createMutation} transformSubmit={(data: CreateRoleFormData) => ({ orgId, data })}>
      <TextField name="name" label="Role Name" placeholder="e.g. Regional Manager" />
      <TextField name="description" label="Description" placeholder="Optional description" />
      <Select name="code" label="Base Role" placeholder="Select the role to build on" options={baseOptions} />

      <DialogActions>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={createMutation.isPending} loadingText="Creating...">
          Create Role
        </Button>
      </DialogActions>
    </Form>
  );
};
