import { useCreateApp } from '@hooks/admin/versions/businesses/apps';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/context/VersionScopeContext';
import { type CreateAppData, createAppSchema } from '@/schemas/admin/apps';

interface AddAppFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddAppForm: React.FC<AddAppFormProps> = ({ onSuccess, onCancel }) => {
  const { versionId, businessId } = useVersionContext();
  const form = useForm<CreateAppData>({
    resolver: zodResolver(createAppSchema),
    defaultValues: { code: '', name: '', description: '', icon: '', versionId, businessId },
  });

  const createMutation = useCreateApp(versionId, businessId, { onSuccess });

  return (
    <Form form={form} mutation={createMutation} resetOnSuccess onCancel={onCancel}>
      <TextField
        name="code"
        label="App Code"
        placeholder="e.g. crm"
        description="Lowercase alphanumeric with hyphens"
      />
      <TextField name="name" label="App Name" placeholder="e.g. CRM" />
      <TextField name="description" label="Description" placeholder="Optional description" />
      <TextField name="icon" label="Icon" placeholder="e.g. briefcase" description="Lucide icon name" />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add App
        </Button>
      </DialogActions>
    </Form>
  );
};
