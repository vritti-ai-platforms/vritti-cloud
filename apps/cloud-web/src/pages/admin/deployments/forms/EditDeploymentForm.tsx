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
import { useForm, useWatch } from 'react-hook-form';
import type { Deployment } from '@/schemas/admin/deployments';
import {
  assembleSecretProvider,
  DEFAULT_SECRET_PROVIDER,
  DEPLOYMENT_DB_MODE_OPTIONS,
  DEPLOYMENT_STATUS_OPTIONS,
  DEPLOYMENT_TENANT_TYPE_OPTIONS,
  DEPLOYMENT_TYPE_OPTIONS,
  SECRET_AUTH_METHOD_FIELDS,
  type SecretAuthMethod,
  type UpdateDeploymentData,
  updateDeploymentSchema,
} from '@/schemas/admin/deployments';
import { renderAddonToggles, renderSecretStoreFields } from '../components/configFields';

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
      mode: deployment.mode,
      edge: deployment.edge,
      addonPgbackrest: deployment.addonPgbackrest,
      addonGitea: deployment.addonGitea,
      regionId: deployment.regionId,
      cloudProviderId: deployment.cloudProviderId,
      tenantType: deployment.tenantType,
      type: deployment.type,
      status: deployment.status,
      version: deployment.version ?? '',
      acmeEmail: deployment.acmeEmail ?? '',
      secretProvider: isManual ? undefined : (deployment.secretProvider ?? DEFAULT_SECRET_PROVIDER),
      secretProviderSecrets: {},
    },
  });

  const dbMode = useWatch({ control: form.control, name: 'mode' });

  const authMethod = useWatch({ control: form.control, name: 'secretProvider.auth.method' }) as
    | SecretAuthMethod
    | undefined;
  const authFields = authMethod ? (SECRET_AUTH_METHOD_FIELDS[authMethod] ?? []) : [];

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
          <Select
            name="mode"
            label="Database"
            placeholder="Select database mode"
            options={DEPLOYMENT_DB_MODE_OPTIONS}
          />
          {dbMode === 'external' && (
            <p className="text-sm text-muted-foreground">
              The agent won't run Postgres. Provide the DB connection in the secret store; the agent connects using
              those creds.
            </p>
          )}

          {renderAddonToggles()}
          {renderSecretStoreFields({ authFields, existing: !!deployment.secretProvider })}
        </>
      )}
      <VersionSelector name="version" label="Version" placeholder="Select version" />
      <Select
        name="type"
        label="Deployment Type"
        description="Deployed routes core through an edge at api.<host>; local reaches core directly on the URL above."
        options={DEPLOYMENT_TYPE_OPTIONS}
      />
      <Select name="tenantType" label="Tenancy" options={DEPLOYMENT_TENANT_TYPE_OPTIONS} />
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
