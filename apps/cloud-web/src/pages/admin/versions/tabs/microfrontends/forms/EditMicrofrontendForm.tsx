import { useUpsertMicrofrontend } from '@hooks/admin/versions/microfrontends';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { Microfrontend } from '@/schemas/admin/microfrontends';
import { type MicrofrontendData, microfrontendSchema } from '@/schemas/admin/microfrontends';

interface EditMicrofrontendFormProps {
  microfrontend: Microfrontend;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditMicrofrontendForm: React.FC<EditMicrofrontendFormProps> = ({ microfrontend, onSuccess, onCancel }) => {
  const isMobile = microfrontend.platform === 'MOBILE';
  const form = useForm<MicrofrontendData>({
    resolver: zodResolver(microfrontendSchema),
    defaultValues: isMobile
      ? {
          platform: 'MOBILE',
          code: microfrontend.code,
          name: microfrontend.name,
          remoteEntryAndroid: microfrontend.remoteEntryAndroid ?? '',
          remoteEntryIos: microfrontend.remoteEntryIos ?? '',
        }
      : {
          platform: 'WEB',
          code: microfrontend.code,
          name: microfrontend.name,
          remoteEntry: microfrontend.remoteEntry ?? '',
        },
  });

  const upsertMutation = useUpsertMicrofrontend(microfrontend.versionId, { onSuccess });

  return (
    <Form
      form={form}
      mutation={upsertMutation}
      transformSubmit={(data: MicrofrontendData) => ({
        versionId: microfrontend.versionId,
        platform: isMobile ? ('mobile' as const) : ('web' as const),
        data,
      })}
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
        disabled
        options={[
          { value: 'WEB', label: 'Web' },
          { value: 'MOBILE', label: 'Mobile' },
        ]}
      />
      {!isMobile && (
        <TextField
          name="remoteEntry"
          label="Remote Entry"
          placeholder="e.g. https://cdn.example.com/remoteEntry.js"
          description="URL to the remote entry file"
        />
      )}
      {isMobile && (
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
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </DialogActions>
    </Form>
  );
};
