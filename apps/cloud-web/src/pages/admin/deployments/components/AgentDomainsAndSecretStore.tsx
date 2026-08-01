import { Button } from '@vritti/quantum-ui/Button';
import { PasswordField } from '@vritti/quantum-ui/PasswordField';
import { Select } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Plus, Trash2 } from 'lucide-react';
import type React from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import {
  SECRET_AUTH_METHOD_FIELDS,
  SECRET_AUTH_METHODS,
  SECRET_PROVIDER_TYPES,
  type SecretAuthMethod,
} from '@/schemas/admin/deployments';

interface AgentDomainsAndSecretStoreProps {
  // Placeholder for secret PasswordFields — differs between create ("Enter …") and edit ("Leave blank to keep existing").
  secretPlaceholder: (label: string) => string;
}

export const AgentDomainsAndSecretStore: React.FC<AgentDomainsAndSecretStoreProps> = ({ secretPlaceholder }) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'domains' });
  const authMethod: SecretAuthMethod = useWatch({ control, name: 'secretProvider.auth.method' });
  const authFields = SECRET_AUTH_METHOD_FIELDS[authMethod] ?? [];

  return (
    <>
      <div className="space-y-3">
        <div>
          <Typography variant="subtitle2">Domains</Typography>
          <Typography variant="body2" intent="muted">
            Each host is served by nginx and proxied to its upstream service:port.
          </Typography>
        </div>
        {fields.map((field, index) => (
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
              onClick={() => remove(index)}
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
          onClick={() => append({ host: '', upstream: '' })}
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
              placeholder={secretPlaceholder(field.label)}
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
  );
};
