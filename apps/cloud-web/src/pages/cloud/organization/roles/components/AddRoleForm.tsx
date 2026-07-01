import { useCreateRole } from '@hooks/cloud/roles';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
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

// Create-role dialog — captures name/description only; permissions are granted afterwards on the role's view page.
export const AddRoleForm: React.FC<AddRoleFormProps> = ({ orgId, onCreated, onCancel }) => {
  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { name: '', description: '', features: {} },
  });
  const createMutation = useCreateRole();

  const onSubmit = (data: CreateRoleFormData) =>
    createMutation.mutate({ orgId, data }, { onSuccess: (role) => onCreated(role) });

  return (
    <Form form={form} onSubmit={onSubmit}>
      <TextField name="name" label="Role Name" placeholder="e.g. Regional Manager" />
      <TextField name="description" label="Description" placeholder="Optional description" />

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
