import { useUpdateApp } from '@hooks/admin/apps';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { App } from '@/schemas/admin/apps';
import { type UpdateAppData, updateAppSchema } from '@/schemas/admin/apps';

interface EditAppFormProps {
  app: App;
  versionId: string;
  businessId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditAppForm: React.FC<EditAppFormProps> = ({ app, versionId, businessId, onSuccess, onCancel }) => {
  const form = useForm<UpdateAppData>({
    resolver: zodResolver(updateAppSchema),
    defaultValues: {
      code: app.code,
      name: app.name,
      description: app.description ?? '',
      icon: app.icon,
    },
  });

  const updateMutation = useUpdateApp(versionId, businessId, { onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({ id: app.id, data })}
    >
      <TextField name="code" label="App Code" placeholder="e.g. crm" description="Lowercase with hyphens" />
      <TextField name="name" label="App Name" placeholder="e.g. CRM" />
      <TextField name="description" label="Description" placeholder="Optional description" />
      <TextField name="icon" label="Icon" placeholder="e.g. briefcase" />
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
