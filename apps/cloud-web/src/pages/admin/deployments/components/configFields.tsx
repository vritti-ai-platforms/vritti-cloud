import { PasswordField } from '@vritti/quantum-ui/PasswordField';
import { Select } from '@vritti/quantum-ui/Select';
import { Switch } from '@vritti/quantum-ui/Switch';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import type { SecretAuthField } from '@/schemas/admin/deployments';
import { SECRET_AUTH_METHODS, SECRET_PROVIDER_TYPES } from '@/schemas/admin/deployments';

// NOTE: these are plain functions that RETURN JSX — they are NOT components and must never be
// rendered as <RenderX />. Invoke them as {renderX(...)} inside a quantum-ui <Form> so the fields
// land as DIRECT children of the form tree. The Form's processChildren walks its child element tree
// and wraps each `name`-bearing field in an RHF <Controller>; fields produced inside a nested
// component's own render are invisible to it and stay unbound.

export function renderAddonToggles() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Typography variant="subtitle2">Add-ons</Typography>
          <Typography variant="body2" intent="muted">
            Optional services the agent provisions alongside the core stack.
          </Typography>
        </div>
        <Switch
          name="addonPgbackrest"
          label="pgBackRest"
          description="Schedule managed Postgres backups to object storage."
        />
        <Switch
          name="addonGitea"
          label="Gitea"
          description="Provision a self-hosted Gitea instance for GitOps configuration."
        />
      </div>

      <div className="space-y-3">
        <div>
          <Typography variant="subtitle2">TLS</Typography>
          <Typography variant="body2" intent="muted">
            The agent issues a single wildcard certificate for this deployment and derives routing automatically. ACME
            registers the certificate under this email.
          </Typography>
        </div>
        <TextField name="acmeEmail" label="ACME Email" placeholder="admin@vrittiai.com" />
      </div>
    </div>
  );
}

interface SecretStoreFieldsArgs {
  authFields: SecretAuthField[];
  // When editing an existing store, secret values may be left blank to keep the current value.
  existing?: boolean;
}

export function renderSecretStoreFields({ authFields, existing }: SecretStoreFieldsArgs) {
  const secretPlaceholder = (label: string) =>
    existing ? 'Leave blank to keep existing' : `Enter ${label.toLowerCase()}`;

  return (
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
  );
}
