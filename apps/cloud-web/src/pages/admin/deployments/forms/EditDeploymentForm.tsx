import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateDeployment } from '@hooks/admin/deployments';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import { CloudProviderSelector } from '@vritti/quantum-ui/selects/cloud-provider';
import { RegionSelector } from '@vritti/quantum-ui/selects/region';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { Deployment } from '@/schemas/admin/deployments';
import { type UpdateDeploymentData, updateDeploymentSchema } from '@/schemas/admin/deployments';

interface EditDeploymentFormProps {
  deployment: Deployment;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditDeploymentForm: React.FC<EditDeploymentFormProps> = ({ deployment, onSuccess, onCancel }) => {
  const form = useForm<UpdateDeploymentData>({
    resolver: zodResolver(updateDeploymentSchema),
    defaultValues: {
      name: deployment.name,
      nexusUrl: deployment.nexusUrl,
      regionId: deployment.regionId,
      cloudProviderId: deployment.cloudProviderId,
      type: deployment.type,
      status: deployment.status,
    },
  });

  const updateMutation = useUpdateDeployment({
    onSuccess: () => onSuccess(),
  });

  return (
    <Form form={form} mutation={updateMutation} showRootError transformSubmit={(data) => ({ id: deployment.id, data })}>
      <TextField name="name" label="Deployment Name" placeholder="e.g. US East Production" />
      <TextField name="nexusUrl" label="Nexus URL" placeholder="https://nexus-us-east.vritti.io" />
      <RegionSelector
        name="regionId"
        label="Region"
        placeholder="Select region"
        onOptionSelect={() => form.setValue('cloudProviderId', '')}
      />
      <CloudProviderSelector name="cloudProviderId" label="Cloud Provider" placeholder="Select provider" />
      <Select
        name="type"
        label="Deployment Type"
        options={[
          { value: 'shared', label: 'Shared' },
          { value: 'dedicated', label: 'Dedicated' },
        ]}
      />
      <Select
        name="status"
        label="Status"
        options={[
          { value: 'active', label: 'Active' },
          { value: 'stopped', label: 'Stopped' },
          { value: 'provisioning', label: 'Provisioning' },
        ]}
      />
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
