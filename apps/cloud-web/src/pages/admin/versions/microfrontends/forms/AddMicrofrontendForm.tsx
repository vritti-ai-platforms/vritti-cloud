import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateMicrofrontend } from '@hooks/admin/microfrontends';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type CreateMicrofrontendData, createMicrofrontendSchema } from '@/schemas/admin/microfrontends';

interface AddMicrofrontendFormProps {
  versionId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddMicrofrontendForm: React.FC<AddMicrofrontendFormProps> = ({ versionId, onSuccess, onCancel }) => {
  const form = useForm<CreateMicrofrontendData>({
    resolver: zodResolver(createMicrofrontendSchema),
    defaultValues: { code: '', name: '', platform: 'WEB', remoteEntry: '' },
  });

  const createMutation = useCreateMicrofrontend(versionId, { onSuccess });

  return (
    <Form
      form={form}
      mutation={createMutation}
      transformSubmit={(data: CreateMicrofrontendData) => ({ versionId, data })}
     
      resetOnSuccess
      onCancel={onCancel}
    >
      <TextField
        name="code"
        label="Code"
        placeholder="e.g. cloud-dashboard"
        description="Lowercase alphanumeric with hyphens"
      />
      <TextField name="name" label="Name" placeholder="e.g. Cloud Dashboard" />
      <Select
        name="platform"
        label="Platform"
        placeholder="Select platform"
        options={[
          { value: 'WEB', label: 'Web' },
          { value: 'MOBILE', label: 'Mobile' },
        ]}
      />
      <TextField
        name="remoteEntry"
        label="Remote Entry"
        placeholder="e.g. https://cdn.example.com/remoteEntry.js"
        description="URL to the remote entry file"
      />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Microfrontend
        </Button>
      </div>
    </Form>
  );
};
