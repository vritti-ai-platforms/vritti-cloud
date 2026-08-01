import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { PasswordField } from '@vritti/quantum-ui/PasswordField';
import { Select } from '@vritti/quantum-ui/Select';
import { CloudProviderSelector } from '@vritti/quantum-ui/selects/cloud-provider';
import { RegionSelector } from '@vritti/quantum-ui/selects/region';
import { VersionSelector } from '@vritti/quantum-ui/selects/version';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useFieldArray, useWatch } from 'react-hook-form';
import {
  type CreateDeploymentData,
  DEPLOYMENT_DB_MODE_OPTIONS,
  SECRET_AUTH_METHOD_FIELDS,
  SECRET_AUTH_METHODS,
  SECRET_PROVIDER_TYPES,
} from '@/schemas/admin/deployments';

interface DetailsStepProps {
  form: UseFormReturn<CreateDeploymentData>;
  onBack: () => void;
  onContinue: () => void;
}

export const DetailsStep: React.FC<DetailsStepProps> = ({ form, onBack, onContinue }) => {
  const managementMode = useWatch({ control: form.control, name: 'managementMode' });
  const regionId = useWatch({ control: form.control, name: 'regionId' });
  const dbMode = useWatch({ control: form.control, name: 'mode' });
  const authMethod = useWatch({ control: form.control, name: 'secretProvider.auth.method' });
  const isAgent = managementMode === 'agent';

  const {
    fields: domainFields,
    append: appendDomain,
    remove: removeDomain,
  } = useFieldArray({
    control: form.control,
    name: 'domains',
  });

  const authFields = authMethod ? SECRET_AUTH_METHOD_FIELDS[authMethod] : [];

  return (
    <Form form={form} onSubmit={onContinue} resetOnSuccess={false}>
      <TextField name="name" label="Deployment Name" placeholder="e.g. US East Production" />
      <TextField name="url" label="Endpoint URL" placeholder="https://nexus-us-east.vrittiai.com" />

      {isAgent && (
        <>
          <Select
            name="type"
            label="Deployment Type"
            placeholder="Select type"
            options={[
              { value: 'shared', label: 'Shared' },
              { value: 'dedicated', label: 'Dedicated' },
            ]}
          />
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
                  placeholder={`Enter ${field.label.toLowerCase()}`}
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

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Form>
  );
};
