import { PasswordField } from '@vritti/quantum-ui/PasswordField';
import { Select } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import type { SecretAuthField } from '@/schemas/admin/deployments';
import { COMPONENT_MODE_OPTIONS, SECRET_AUTH_METHODS, SECRET_PROVIDER_TYPES } from '@/schemas/admin/deployments';

// NOTE: these are plain functions that RETURN JSX — they are NOT components and must never be rendered
// as <RenderX />. Invoke them as {renderX(...)} inside a quantum-ui <Form> so the fields land as DIRECT
// children of the form tree (the Form's processChildren walks its child element tree and wraps each
// `name`-bearing field in an RHF <Controller>; fields produced inside a nested component's own render are
// invisible to it and stay unbound). Any show/hide branching must be computed by the CALLER (via
// useWatch) and passed in, so the JSX stays a direct child.

// Wizard: database mode only. pgBackRest backups are configured later on the Database component page.
export function renderWizardDatabaseFields({ managed }: { managed: boolean }) {
  return (
    <div className="space-y-4">
      <div>
        <Typography variant="subtitle2">Database</Typography>
        <Typography variant="body2" intent="muted">
          Choose whether the agent runs its own Postgres or connects to an existing database.
        </Typography>
      </div>
      <Select
        name="components.database.mode"
        label="Mode"
        placeholder="Select database mode"
        options={COMPONENT_MODE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
          description:
            option.value === 'managed'
              ? 'The agent runs and manages a Postgres instance.'
              : 'The agent connects to an existing database using credentials from the secret store.',
        }))}
      />
      {!managed && (
        <p className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
          The agent won't run Postgres — provide the DB connection in the secret store. Backups (pgBackRest) are only
          available for a managed database.
        </p>
      )}
    </div>
  );
}

// Wizard: edge mode + (managed only) the ACME registration email for the wildcard certificate.
export function renderWizardEdgeFields({ managed }: { managed: boolean }) {
  return (
    <div className="space-y-4">
      <div>
        <Typography variant="subtitle2">Edge &amp; TLS</Typography>
        <Typography variant="body2" intent="muted">
          How HTTP traffic reaches the stack and how TLS is terminated.
        </Typography>
      </div>
      <Select
        name="components.edge.mode"
        label="Mode"
        placeholder="Select edge mode"
        options={COMPONENT_MODE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
          description:
            option.value === 'managed'
              ? 'The agent runs nginx and issues a wildcard certificate via ACME (DNS-01).'
              : 'TLS / routing handled outside the agent (an existing ingress or load balancer).',
        }))}
      />
      {managed ? (
        <TextField
          name="components.edge.acmeEmail"
          label="ACME Email"
          placeholder="ops@vrittiai.com"
          description="Used for Let's Encrypt registration and expiry notices."
        />
      ) : (
        <Typography variant="body2" intent="muted">
          Another proxy fronts core — the agent runs no nginx and issues no certificate.
        </Typography>
      )}
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
        name="components.secretStore.type"
        label="Type"
        placeholder="Select type"
        options={SECRET_PROVIDER_TYPES.map((type) => ({ value: type.value, label: type.label }))}
      />
      <TextField name="components.secretStore.url" label="URL" placeholder="https://infisical.vrittiai.com" />
      <TextField name="components.secretStore.projectId" label="Project ID" placeholder="Infisical project id" />
      <TextField name="components.secretStore.env" label="Environment" placeholder="e.g. apw1" />
      <Select
        name="components.secretStore.auth.method"
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
            name={`components.secretStore.auth.params.${field.key}`}
            label={field.label}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        ),
      )}
    </div>
  );
}
