import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateApp } from '@hooks/admin/apps';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import { type CreateAppData, createAppSchema } from '@/schemas/admin/apps';

interface AddAppFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddAppForm: React.FC<AddAppFormProps> = ({ onSuccess, onCancel }) => {
  const { versionId } = useVersionContext();

  const form = useForm<CreateAppData>({
    resolver: zodResolver(createAppSchema),
    defaultValues: { code: '', name: '', description: '', icon: '', versionId: versionId ?? '' },
  });

  const createMutation = useCreateApp(versionId, { onSuccess });

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
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add App
        </Button>
      </div>
    </Form>
  );
};
