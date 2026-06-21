import { useCreateMicrofrontend } from '@hooks/admin/versions/microfrontends';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useVersionContext } from '@/context/VersionScopeContext';
import { type CreateMicrofrontendData, createMicrofrontendSchema } from '@/schemas/admin/microfrontends';

interface AddMicrofrontendFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddMicrofrontendForm: React.FC<AddMicrofrontendFormProps> = ({ onSuccess, onCancel }) => {
  const { versionId } = useVersionContext();
  const form = useForm<CreateMicrofrontendData>({
    resolver: zodResolver(createMicrofrontendSchema),
    defaultValues: { code: '', name: '', platform: 'WEB', remoteEntry: '' },
  });

  const platform = useWatch({ control: form.control, name: 'platform' });
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
      {platform === 'WEB' && (
        <TextField
          name="remoteEntry"
          label="Remote Entry"
          placeholder="e.g. https://cdn.example.com/remoteEntry.js"
          description="URL to the remote entry file"
        />
      )}
      {platform === 'MOBILE' && (
        <>
          <TextField
            name="remoteEntryAndroid"
            label="Android Remote Entry"
            placeholder="e.g. https://cdn.example.com/android/mf-manifest.json"
            description="URL to the Android manifest"
          />
          <TextField
            name="remoteEntryIos"
            label="iOS Remote Entry"
            placeholder="e.g. https://cdn.example.com/ios/mf-manifest.json"
            description="URL to the iOS manifest"
          />
        </>
      )}
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Microfrontend
        </Button>
      </DialogActions>
    </Form>
  );
};
