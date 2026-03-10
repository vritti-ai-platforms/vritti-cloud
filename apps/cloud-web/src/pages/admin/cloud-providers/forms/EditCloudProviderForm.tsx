import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateCloudProvider } from '@hooks/admin/cloud-providers';
import { Button } from '@vritti/quantum-ui/Button';
import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { CloudProvider } from '@/schemas/admin/cloud-providers';
import { type CloudProviderFormData, cloudProviderSchema } from '@/schemas/admin/cloud-providers';

type FormValues = CloudProviderFormData;

interface EditCloudProviderFormProps {
  provider: CloudProvider;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditCloudProviderForm: React.FC<EditCloudProviderFormProps> = ({ provider, onSuccess, onCancel }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(cloudProviderSchema),
    defaultValues: {
      name: provider.name,
      code: provider.code,
      logoUrl: provider.logoUrl ?? '',
      logoDarkUrl: provider.logoDarkUrl ?? '',
      sameAsLight: !!provider.logoDarkUrl && provider.logoDarkUrl === provider.logoUrl,
    },
  });

  const sameAsLight = useWatch({ control: form.control, name: 'sameAsLight' });
  const logoUrl = useWatch({ control: form.control, name: 'logoUrl' });

  useEffect(() => {
    if (sameAsLight) form.setValue('logoDarkUrl', logoUrl ?? '');
  }, [sameAsLight, logoUrl, form]);

  const updateMutation = useUpdateCloudProvider({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      showRootError
      transformSubmit={({ sameAsLight, ...data }) => ({
        id: provider.id,
        data: { ...data, logoDarkUrl: sameAsLight ? data.logoUrl : data.logoDarkUrl },
      })}
    >
      <TextField name="name" label="Provider Name" placeholder="e.g. Amazon Web Services" />
      <TextField
        name="code"
        label="Code"
        placeholder="e.g. AWS"
        description="Short identifier used across the platform"
      />
      <TextField name="logoUrl" label="Logo URL (Light Mode)" placeholder="https://cdn.example.com/aws-light.svg" />
      <div className="space-y-2">
        <TextField
          name="logoDarkUrl"
          label="Logo URL (Dark Mode)"
          placeholder="https://cdn.example.com/aws-dark.svg"
          disabled={!!sameAsLight}
        />
        <Checkbox name="sameAsLight" label="Same as light mode" />
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </div>
    </Form>
  );
};
