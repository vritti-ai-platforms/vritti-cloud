import { useDeployment, useUpdateDeployment } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Select } from '@vritti/quantum-ui/Select';
import { Switch } from '@vritti/quantum-ui/Switch';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { z, zodNumericField, zodResolver } from '@vritti/quantum-ui/zod';
import { Activity, Database } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useDeploymentAgent } from '@/providers/AgentStreamProvider';
import {
  COMPONENT_MODE_OPTIONS,
  COMPONENT_MODE_VALUES,
  type ComponentMode,
  servicesForComponent,
} from '@/schemas/admin/deployments';
import { EditableConfigCard } from '../../components/EditableConfigCard';
import { LogStream } from './LogStream';
import { ServicesTable } from './ServicesTable';

const databaseFormSchema = z.object({
  mode: z.enum(COMPONENT_MODE_VALUES),
  pgbackrestEnabled: z.boolean(),
  retention: zodNumericField({ integer: true, min: 1, max: 52 }),
});

type DatabaseFormValues = z.infer<typeof databaseFormSchema>;

// Configure the database component: mode, plus the Enable-pgBackRest opt-in (with retention). Saving
// PATCHes the spec's database component, which bumps the generation for the agent to reconcile.
export const DatabasePage = () => {
  const { id } = useSlugParams('deploymentSlug');
  const { data: deployment } = useDeployment(id);
  const agent = useDeploymentAgent();
  const [editing, setEditing] = useState(false);

  const database = deployment.spec.components.database;
  const buildDefaults = (): DatabaseFormValues => ({
    mode: database?.mode ?? 'managed',
    pgbackrestEnabled: !!database?.backup,
    retention: database?.backup?.retention ?? 4,
  });

  const form = useForm<DatabaseFormValues>({
    resolver: zodResolver(databaseFormSchema),
    defaultValues: buildDefaults(),
  });
  const mode = useWatch({ control: form.control, name: 'mode' });
  const pgbackrestOn = useWatch({ control: form.control, name: 'pgbackrestEnabled' });
  const managed = mode === 'managed';

  // pgBackRest is only valid for a managed DB — force it off when switching to external.
  useEffect(() => {
    if (mode === 'external') form.setValue('pgbackrestEnabled', false);
  }, [mode, form]);

  const mutation = useUpdateDeployment({ onSuccess: () => setEditing(false) });
  const onCancel = () => {
    form.reset(buildDefaults());
    setEditing(false);
  };

  const transformSubmit = (data: DatabaseFormValues) => ({
    id: deployment.id,
    data: {
      components: {
        database: {
          mode: data.mode as ComponentMode,
          ...(data.pgbackrestEnabled && data.mode === 'managed' ? { backup: { retention: data.retention } } : {}),
        },
      },
    },
  });

  const services = servicesForComponent(agent.services, 'database');
  const logTargets = services.map((s) => ({ value: s.service, label: s.service }));

  const view =
    database?.mode === 'managed' ? (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="Mode" type="string" value={<Badge variant="success">Managed</Badge>} />
          <DetailField
            label="pgBackRest"
            type="string"
            value={
              <Badge variant={database.backup ? 'success' : 'secondary'}>
                {database.backup ? 'Enabled' : 'Disabled'}
              </Badge>
            }
          />
          {database.backup && (
            <DetailField label="Retention" type="string" value={`${database.backup.retention} full backups`} mono />
          )}
        </div>
        {!database.backup && (
          <Typography variant="body2" intent="muted">
            Enable pgBackRest for point-in-time backups. Enabling bumps the generation; the agent creates the stanza and
            takes a first full backup on its next reconcile.
          </Typography>
        )}
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Mode" type="string" value={<Badge variant="outline">External</Badge>} />
        <div className="sm:col-span-2">
          <Typography variant="body2" intent="muted">
            The agent doesn't run Postgres — the DB connection is provided via the secret store.
          </Typography>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Database" description="How this deployment's Postgres is provided, and its backups." />

      <EditableConfigCard
        title="Configuration"
        description="Managed database, plus pgBackRest backups."
        icon={Database}
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={onCancel}
        form={form}
        mutation={mutation}
        transformSubmit={transformSubmit}
        view={view}
      >
        <Select name="mode" label="Mode" placeholder="Select database mode" options={COMPONENT_MODE_OPTIONS} />
        {managed ? (
          <div className="space-y-4 rounded-lg border border-dashed p-4">
            <Switch
              name="pgbackrestEnabled"
              label="Enable pgBackRest"
              description="Encrypted backups to S3-compatible storage. The offsite target and keys come from the secret store."
            />
            {pgbackrestOn && (
              <TextField
                name="retention"
                type="number"
                integer
                label="Full backups retained"
                placeholder="4"
                description="Applies to both the local and offsite repos. Default 4."
              />
            )}
          </div>
        ) : (
          <Typography variant="body2" intent="muted">
            The agent won't run Postgres — provide the DB connection in the secret store. pgBackRest isn't available for
            an external database.
          </Typography>
        )}
      </EditableConfigCard>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="size-5" />
            </div>
            <div className="space-y-1">
              <CardTitle>Services</CardTitle>
              <CardDescription>Live health for this component.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ServicesTable services={services} />
        </CardContent>
      </Card>

      {logTargets.length > 0 && (
        <LogStream
          deploymentId={id}
          targets={logTargets}
          connected={agent.connected}
          title="Database logs"
          description="Tail the Postgres container in real time."
        />
      )}
    </div>
  );
};
