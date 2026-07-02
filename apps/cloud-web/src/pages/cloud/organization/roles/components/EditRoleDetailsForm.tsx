import { useUpdateRole } from '@hooks/cloud/roles';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type CreateRoleFormData, createRoleSchema, type Role } from '@/schemas/cloud/roles';

interface EditRoleDetailsFormProps {
  orgId: string;
  role: Role;
  onSuccess: () => void;
  onCancel: () => void;
}

// The role's "settings" — name/description. Permissions are edited separately on the view page.
export const EditRoleDetailsForm: React.FC<EditRoleDetailsFormProps> = ({ orgId, role, onSuccess, onCancel }) => {
  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: role.name,
      description: role.description ?? '',
      features: role.features,
    },
  });
  const updateMutation = useUpdateRole({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      transformSubmit={(data: CreateRoleFormData) => ({
        orgId,
        roleId: role.id,
        data: { name: data.name, description: data.description },
      })}
    >
      <div className="flex flex-col gap-4 px-6 py-4">
        <TextField name="name" label="Role Name" placeholder="e.g. Regional Manager" />
        <TextField name="description" label="Description" placeholder="Optional description" />
      </div>
      <DialogActions>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={updateMutation.isPending} loadingText="Saving...">
          Save Changes
        </Button>
      </DialogActions>
    </Form>
  );
};
