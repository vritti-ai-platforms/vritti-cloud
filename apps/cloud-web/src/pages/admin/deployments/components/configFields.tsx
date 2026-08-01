import { Button } from '@vritti/quantum-ui/Button';
import { PasswordField } from '@vritti/quantum-ui/PasswordField';
import { RadioGroup } from '@vritti/quantum-ui/RadioGroup';
import { Select } from '@vritti/quantum-ui/Select';
import { Switch } from '@vritti/quantum-ui/Switch';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Plus, Trash2 } from 'lucide-react';
import type { SecretAuthField } from '@/schemas/admin/deployments';
import { SECRET_AUTH_METHODS, SECRET_PROVIDER_TYPES } from '@/schemas/admin/deployments';

// NOTE: these are plain functions that RETURN JSX — they are NOT components and must never be
// rendered as <RenderX />. Invoke them as {renderX(...)} inside a quantum-ui <Form> so the fields
// land as DIRECT children of the form tree. The Form's processChildren walks its child element tree
// and wraps each `name`-bearing field in an RHF <Controller>; fields produced inside a nested
// component's own render are invisible to it and stay unbound.

const EDGE_OPTIONS = [
  {
    value: 'managed',
    label: 'Managed',
    description: 'The agent runs nginx and issues TLS certificates (ACME) for the hosts below.',
  },
  {
    value: 'external',
    label: 'External',
    description: 'TLS and routing are handled outside the agent by an existing ingress or load balancer.',
  },
];

interface EdgeFieldsArgs {
  isManaged: boolean;
  domainFields: { id: string }[];
  onAddDomain: () => void;
  onRemoveDomain: (index: number) => void;
}

export function renderEdgeFields({ isManaged, domainFields, onAddDomain, onRemoveDomain }: EdgeFieldsArgs) {
  return (
    <div className="space-y-4">
      <div>
        <Typography variant="subtitle2">Edge (nginx + TLS)</Typography>
        <Typography variant="body2" intent="muted">
          Choose whether the agent terminates TLS and reverse-proxies traffic, or leaves the edge to existing
          infrastructure.
        </Typography>
      </div>

      <RadioGroup name="edge" variant="card" orientation="horizontal" options={EDGE_OPTIONS} />

      {isManaged ? (
        <>
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
                  disabled={domainFields.length <= 1}
                  onClick={() => onRemoveDomain(index)}
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
              onClick={onAddDomain}
            >
              Add domain
            </Button>
          </div>

          <TextField name="acmeEmail" label="ACME Email" placeholder="admin@vrittiai.com" />
        </>
      ) : (
        <p className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
          The agent won't run nginx or issue certificates. Route traffic to the deployment through your own edge and
          point it at the core service.
        </p>
      )}
    </div>
  );
}

export function renderAddonToggles() {
  return (
    <div className="space-y-4 border-t pt-6">
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
