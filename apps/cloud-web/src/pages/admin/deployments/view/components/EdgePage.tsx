import { useDeployment, useUpdateDeployment } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { DateTimeCell, StringCell } from '@vritti/quantum-ui/DataTable';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Select } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { z, zodResolver } from '@vritti/quantum-ui/zod';
import { Activity, Lock, ScrollText } from 'lucide-react';
import { useState } from 'react';
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

const EXPIRY_WARNING_DAYS = 21;

function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

function ExpiryBadge({ notAfter }: { notAfter: string }) {
  const days = daysUntil(notAfter);
  if (days <= 0) return <Badge variant="destructive">Expired</Badge>;
  if (days <= EXPIRY_WARNING_DAYS) return <Badge variant="warning">{`Expires in ${days}d`}</Badge>;
  return <Badge variant="success">{`${days}d`}</Badge>;
}

const edgeFormSchema = z
  .object({
    mode: z.enum(COMPONENT_MODE_VALUES),
    acmeEmail: z.string().email('Must be a valid email').optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'managed' && !data.acmeEmail) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['acmeEmail'], message: 'ACME email is required' });
    }
  });

type EdgeFormValues = z.infer<typeof edgeFormSchema>;

// Configure the edge component: mode + ACME email. Certificates and live nginx/acme-dns health are
// surfaced alongside; the delegation card appears while a managed edge is blocked awaiting DNS.
export const EdgePage = () => {
  const { id } = useSlugParams('deploymentSlug');
  const { data: deployment } = useDeployment(id);
  const agent = useDeploymentAgent();
  const [editing, setEditing] = useState(false);

  const edge = deployment.spec.components.edge;
  const buildDefaults = (): EdgeFormValues => ({ mode: edge?.mode ?? 'managed', acmeEmail: edge?.acmeEmail ?? '' });

  const form = useForm<EdgeFormValues>({ resolver: zodResolver(edgeFormSchema), defaultValues: buildDefaults() });
  const mode = useWatch({ control: form.control, name: 'mode' });
  const managed = mode === 'managed';

  const mutation = useUpdateDeployment({ onSuccess: () => setEditing(false) });
  const onCancel = () => {
    form.reset(buildDefaults());
    setEditing(false);
  };

  const transformSubmit = (data: EdgeFormValues) => ({
    id: deployment.id,
    data: {
      components: {
        edge: {
          mode: data.mode as ComponentMode,
          ...(data.mode === 'managed' && data.acmeEmail ? { acmeEmail: data.acmeEmail } : {}),
        },
      },
    },
  });

  const services = servicesForComponent(agent.services, 'edge');
  const logTargets = services.map((s) => ({ value: s.service, label: s.service }));

  const view = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField
          label="Mode"
          type="string"
          value={
            <Badge variant={edge?.mode === 'managed' ? 'success' : 'secondary'}>
              {edge?.mode === 'managed' ? 'Managed' : 'External'}
            </Badge>
          }
        />
        {edge?.mode === 'managed' && <DetailField label="ACME Email" type="string" value={edge.acmeEmail} mono />}
      </div>
      {edge?.mode === 'managed' ? (
        <Typography variant="body2" intent="muted">
          Routes are derived automatically: <span className="font-mono">api.</span> → core-server,{' '}
          <span className="font-mono">git.</span> → gitea (when enabled), <span className="font-mono">*.</span> →
          core-web.
        </Typography>
      ) : (
        <Typography variant="body2" intent="muted">
          Another proxy/ingress fronts core — the agent runs no nginx and issues no certificate.
        </Typography>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Edge & TLS" description="How HTTP traffic is fronted, and the wildcard certificate." />

      <EditableConfigCard
        title="Configuration"
        description="Managed edge (nginx + ACME) or an external proxy."
        icon={Lock}
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={onCancel}
        form={form}
        mutation={mutation}
        transformSubmit={transformSubmit}
        view={view}
      >
        <Select name="mode" label="Mode" placeholder="Select edge mode" options={COMPONENT_MODE_OPTIONS} />
        {managed ? (
          <TextField
            name="acmeEmail"
            label="ACME Email"
            placeholder="ops@vrittiai.com"
            description="Used for Let's Encrypt registration and expiry notices."
          />
        ) : (
          <Typography variant="body2" intent="muted">
            Another proxy fronts core — the agent runs no nginx and issues no certificate.
          </Typography>
        )}
      </EditableConfigCard>

      {agent.delegation && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ScrollText className="size-5" />
              </div>
              <div className="space-y-1">
                <CardTitle>Pending DNS delegation</CardTitle>
                <CardDescription>Add these records so the wildcard certificate can be issued.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <DetailField label="Nameserver (A)" type="string" value={agent.delegation.serverIp} mono />
            <DetailField label="Zone (NS)" type="string" value={agent.delegation.nameserver} mono />
            <DetailField label="Challenge (CNAME)" type="string" value={agent.delegation.target} mono />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ScrollText className="size-5" />
            </div>
            <div className="space-y-1">
              <CardTitle>Certificates</CardTitle>
              <CardDescription>Issued by the agent via ACME DNS-01.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {agent.certificates.length === 0 ? (
            <Typography variant="body2" intent="muted">
              No certificates issued yet.
            </Typography>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="px-4 py-2 font-medium">Host</th>
                    <th className="px-4 py-2 font-medium">Issued</th>
                    <th className="px-4 py-2 font-medium">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {agent.certificates.map((cert) => (
                    <tr key={cert.host} className="border-b last:border-0">
                      <td className="px-4 py-2">
                        <StringCell value={cert.host} mono />
                      </td>
                      <td className="px-4 py-2">
                        <DateTimeCell value={cert.issuedAt} />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <DateTimeCell value={cert.notAfter} />
                          <ExpiryBadge notAfter={cert.notAfter} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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
          title="Edge logs"
          description="Tail the nginx / acme-dns containers in real time."
        />
      )}
    </div>
  );
};
