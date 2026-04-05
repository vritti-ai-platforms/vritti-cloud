import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateMicrofrontend } from '@hooks/admin/microfrontends';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { Microfrontend } from '@/schemas/admin/microfrontends';
import { type UpdateMicrofrontendData, updateMicrofrontendSchema } from '@/schemas/admin/microfrontends';

interface EditMicrofrontendFormProps {
  microfrontend: Microfrontend;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditMicrofrontendForm: React.FC<EditMicrofrontendFormProps> = ({ microfrontend, onSuccess, onCancel }) => {
  const form = useForm<UpdateMicrofrontendData>({
    resolver: zodResolver(updateMicrofrontendSchema),
    defaultValues: {
      code: microfrontend.code,
      name: microfrontend.name,
      platform: microfrontend.platform,
      remoteEntry: microfrontend.remoteEntry,
    },
  });

  const updateMutation = useUpdateMicrofrontend(microfrontend.versionId, { onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      transformSubmit={(data: UpdateMicrofrontendData) => ({ versionId: microfrontend.versionId, id: microfrontend.id, data })}
      showRootError
      resetOnSuccess={false}
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
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </div>
    </Form>
  );
};
