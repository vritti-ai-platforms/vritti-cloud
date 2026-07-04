import { useCreateDeployment } from '@hooks/admin/deployments';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { CloudProviderSelector } from '@vritti/quantum-ui/selects/cloud-provider';
import { RegionSelector } from '@vritti/quantum-ui/selects/region';
import { VersionSelector } from '@vritti/quantum-ui/selects/version';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type CreateDeploymentData, createDeploymentSchema, type Deployment } from '@/schemas/admin/deployments';

interface AddDeploymentFormProps {
  onSuccess: (deployment: Deployment) => void;
  onCancel: () => void;
}

export const AddDeploymentForm: React.FC<AddDeploymentFormProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<CreateDeploymentData>({
    resolver: zodResolver(createDeploymentSchema),
    defaultValues: { name: '', url: '', type: 'shared', version: '' },
  });

  const regionId = form.watch('regionId');

  const createMutation = useCreateDeployment({ onSuccess: (response) => onSuccess(response.data) });

  return (
    <Form form={form} mutation={createMutation} resetOnSuccess onCancel={onCancel}>
      <TextField name="name" label="Deployment Name" placeholder="e.g. US East Production" />
      <TextField name="url" label="URL" placeholder="https://nexus-us-east.vritti.io" />
      <RegionSelector
        name="regionId"
        label="Region"
        placeholder="Select region"
        onOptionSelect={() => form.setValue('cloudProviderId', '')}
      />
      <CloudProviderSelector
        name="cloudProviderId"
        label="Cloud Provider"
        placeholder="Select provider"
        disabled={!regionId}
        params={regionId ? { regionId: String(regionId) } : undefined}
      />
      <Select
        name="type"
        label="Deployment Type"
        placeholder="Select type"
        options={[
          { value: 'shared', label: 'Shared' },
          { value: 'dedicated', label: 'Dedicated' },
        ]}
      />
      <VersionSelector name="version" label="Version" placeholder="Select version" />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Deployment
        </Button>
      </DialogActions>
    </Form>
  );
};
