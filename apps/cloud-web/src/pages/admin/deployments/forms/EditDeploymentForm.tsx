import { useUpdateDeployment } from '@hooks/admin/deployments';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { PasswordField } from '@vritti/quantum-ui/PasswordField';
import { Select } from '@vritti/quantum-ui/Select';
import { CloudProviderSelector } from '@vritti/quantum-ui/selects/cloud-provider';
import { RegionSelector } from '@vritti/quantum-ui/selects/region';
import { VersionSelector } from '@vritti/quantum-ui/selects/version';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { Plus, Trash2 } from 'lucide-react';
import type React from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import type { Deployment } from '@/schemas/admin/deployments';
import {
  assembleSecretProvider,
  DEFAULT_SECRET_PROVIDER,
  DEPLOYMENT_DB_MODE_OPTIONS,
  DEPLOYMENT_STATUS_OPTIONS,
  SECRET_AUTH_METHOD_FIELDS,
  SECRET_AUTH_METHODS,
  SECRET_PROVIDER_TYPES,
  type UpdateDeploymentData,
  updateDeploymentSchema,
} from '@/schemas/admin/deployments';

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

  const dbMode = useWatch({ control: form.control, name: 'mode' });
  const authMethod = useWatch({ control: form.control, name: 'secretProvider.auth.method' });

  const {
    fields: domainFields,
    append: appendDomain,
    remove: removeDomain,
  } = useFieldArray({
    control: form.control,
    name: 'domains',
  });

  const authFields = authMethod ? SECRET_AUTH_METHOD_FIELDS[authMethod] : [];

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
          <TextField name="acmeEmail" label="ACME Email" placeholder="admin@vrittiai.com" />

          <div className="space-y-3">
            <div>
              <Typography variant="subtitle2">Domains</Typography>
              <Typography variant="body2" intent="muted">
                Each host is served by nginx and proxied to its upstream service:port.
              </Typography>
            </div>
            {domainFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <TextField name={`domains.${index}.host`} label="Host" placeholder="app.example.com" />
                </div>
                <div className="flex-1">
                  <TextField name={`domains.${index}.upstream`} label="Upstream" placeholder="web:3000" />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="mt-8 text-destructive hover:text-destructive"
                  onClick={() => removeDomain(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              startAdornment={<Plus className="size-4" />}
              onClick={() => appendDomain({ host: '', upstream: '' })}
            >
              Add domain
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <Typography variant="subtitle2">Secret Store</Typography>
              <Typography variant="body2" intent="muted">
                Tells the agent where and how to fetch this deployment's secrets.
              </Typography>
            </div>
            <Select
              name="secretProvider.type"
              label="Type"
              placeholder="Select type"
              options={SECRET_PROVIDER_TYPES.map((type) => ({ value: type.value, label: type.label }))}
            />
            <TextField name="secretProvider.url" label="URL" placeholder="https://infisical.vrittiai.com" />
            <TextField name="secretProvider.projectId" label="Project ID" placeholder="Infisical project id" />
            <TextField name="secretProvider.env" label="Environment" placeholder="e.g. apw1" />
            <Select
              name="secretProvider.auth.method"
              label="Auth Method"
              placeholder="Select auth method"
              options={SECRET_AUTH_METHODS.map((method) => ({ value: method.value, label: method.label }))}
            />
            {authFields.map((field) =>
              field.secret ? (
                <PasswordField
                  key={field.key}
                  name={`secretProviderSecrets.${field.key}`}
                  label={field.label}
                  placeholder="Leave blank to keep existing"
                />
              ) : (
                <TextField
                  key={field.key}
                  name={`secretProvider.auth.params.${field.key}`}
                  label={field.label}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              ),
            )}
          </div>
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
