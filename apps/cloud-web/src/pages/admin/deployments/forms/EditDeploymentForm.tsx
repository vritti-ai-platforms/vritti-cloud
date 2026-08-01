import { useUpdateDeployment } from '@hooks/admin/deployments';
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
import type { Deployment } from '@/schemas/admin/deployments';
import {
  assembleSecretProvider,
  DEFAULT_SECRET_PROVIDER,
  DEPLOYMENT_STATUS_OPTIONS,
  type UpdateDeploymentData,
  updateDeploymentSchema,
} from '@/schemas/admin/deployments';
import { AgentDomainsAndSecretStore } from '../components/AgentDomainsAndSecretStore';

interface EditDeploymentFormProps {
  deployment: Deployment;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditDeploymentForm: React.FC<EditDeploymentFormProps> = ({ deployment, onSuccess, onCancel }) => {
  const isManual = deployment.managementMode === 'manual';

  const form = useForm<UpdateDeploymentData>({
    resolver: zodResolver(updateDeploymentSchema),
    defaultValues: {
      name: deployment.name,
      url: deployment.url,
      regionId: deployment.regionId,
      cloudProviderId: deployment.cloudProviderId,
      type: deployment.type,
      status: deployment.status,
      version: deployment.version ?? '',
      acmeEmail: deployment.acmeEmail ?? '',
      domains: deployment.domains,
      secretProvider: isManual ? undefined : (deployment.secretProvider ?? DEFAULT_SECRET_PROVIDER),
      secretProviderSecrets: {},
    },
  });

  const updateMutation = useUpdateDeployment({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({
        id: deployment.id,
        data: isManual ? data : { ...data, ...assembleSecretProvider(data) },
      })}
    >
      <TextField name="name" label="Deployment Name" placeholder="e.g. US East Production" />
      <TextField name="url" label="URL" placeholder="https://nexus-us-east.vrittiai.com" />
      {!isManual && (
        <>
          <RegionSelector
            name="regionId"
            label="Region"
            placeholder="Select region"
            onOptionSelect={() => form.setValue('cloudProviderId', '')}
          />
          <CloudProviderSelector name="cloudProviderId" label="Cloud Provider" placeholder="Select provider" />
          <TextField name="acmeEmail" label="ACME Email" placeholder="admin@vrittiai.com" />
          <AgentDomainsAndSecretStore secretPlaceholder={() => 'Leave blank to keep existing'} />
        </>
      )}
      <VersionSelector name="version" label="Version" placeholder="Select version" />
      <Select
        name="type"
        label="Deployment Type"
        options={[
          { value: 'shared', label: 'Shared' },
          { value: 'dedicated', label: 'Dedicated' },
        ]}
      />
      <Select name="status" label="Status" options={DEPLOYMENT_STATUS_OPTIONS} />
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
