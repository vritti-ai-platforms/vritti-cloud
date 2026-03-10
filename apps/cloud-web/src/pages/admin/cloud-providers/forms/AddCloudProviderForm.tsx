import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateCloudProvider } from '@hooks/admin/cloud-providers';
import { Button } from '@vritti/quantum-ui/Button';
import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { type CloudProviderFormData, cloudProviderSchema } from '@/schemas/admin/cloud-providers';

type FormValues = CloudProviderFormData;

interface AddCloudProviderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddCloudProviderForm: React.FC<AddCloudProviderFormProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(cloudProviderSchema),
    defaultValues: { name: '', code: '', logoUrl: '', logoDarkUrl: '' },
  });

  const sameAsLight = useWatch({ control: form.control, name: 'sameAsLight' });
  const logoUrl = useWatch({ control: form.control, name: 'logoUrl' });

  // Keep logoDarkUrl in sync whenever sameAsLight is on or logoUrl changes
  useEffect(() => {
    if (sameAsLight) form.setValue('logoDarkUrl', logoUrl ?? '');
  }, [sameAsLight, logoUrl, form]);

  const createMutation = useCreateCloudProvider({
    onSuccess: () => {
      form.reset();
      onSuccess();
    },
  });

  // Cancel resets the form then notifies the parent
  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <Form
      form={form}
      mutation={createMutation}
      showRootError
      transformSubmit={({ sameAsLight, ...data }) => ({
        ...data,
        logoDarkUrl: sameAsLight ? data.logoUrl : data.logoDarkUrl,
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
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Provider
        </Button>
      </div>
    </Form>
  );
};
