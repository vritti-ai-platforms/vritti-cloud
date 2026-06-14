import { useCreateRoleTemplate } from '@hooks/admin/role-templates';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { AppSelector } from '@vritti/quantum-ui/selects/app';
import { BusinessSelector } from '@vritti/quantum-ui/selects/business';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import { type CreateRoleTemplateData, createRoleTemplateSchema } from '@/schemas/admin/role-templates';

interface AddRoleTemplateFormProps {
  businessId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddRoleTemplateForm: React.FC<AddRoleTemplateFormProps> = ({ businessId, onSuccess, onCancel }) => {
  const { versionId } = useVersionContext();

  const form = useForm<CreateRoleTemplateData>({
    resolver: zodResolver(createRoleTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      scope: 'GLOBAL',
      businessId,
      appIds: [],
      versionId: versionId ?? '',
    },
  });

  const createMutation = useCreateRoleTemplate(versionId, businessId, { onSuccess });

  return (
    <Form form={form} mutation={createMutation} resetOnSuccess onCancel={onCancel}>
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
      <BusinessSelector name="businessId" label="Business" placeholder="Select business" />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Role Template
        </Button>
      </DialogActions>
    </Form>
  );
};
