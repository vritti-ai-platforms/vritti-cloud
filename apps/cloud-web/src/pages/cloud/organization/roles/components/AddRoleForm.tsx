import { useCreateRole, useRoleTemplates } from '@hooks/cloud/roles';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { type CreateRoleFormData, createRoleSchema, type Role } from '@/schemas/cloud/roles';

interface AddRoleFormProps {
  orgId: string;
  onCreated: (role: Role) => void;
  onCancel: () => void;
}

export const AddRoleForm: React.FC<AddRoleFormProps> = ({ orgId, onCreated, onCancel }) => {
  const { data: templates = [] } = useRoleTemplates(orgId);
  const templateByCode = useMemo(() => new Map(templates.map((t) => [t.code, t])), [templates]);
  const baseOptions = useMemo(() => templates.map((t) => ({ value: t.code, label: t.name })), [templates]);

  const resolver = useMemo(
    () =>
      zodResolver(
        createRoleSchema.superRefine((data, ctx) => {
          const base = templateByCode.get(data.code);
          if (base && data.name.trim() === base.name) {
            ctx.addIssue({ code: 'custom', path: ['name'], message: 'Choose a name different from the base role.' });
          }
        }),
      ),
    [templateByCode],
  );

  const form = useForm<CreateRoleFormData>({
    resolver,
    defaultValues: { code: '', name: '', description: '', features: {} },
  });
  const createMutation = useCreateRole({ onSuccess: (res) => onCreated(res.data) });

  return (
    <Form
      form={form}
      mutation={createMutation}
      transformSubmit={(data: CreateRoleFormData) => ({
        orgId,
        data: {
          code: data.code,
          name: data.name,
          description: data.description,
          features: {},
        },
      })}
    >
      <Select name="code" label="Base Role" placeholder="Select a base role" options={baseOptions} />
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
