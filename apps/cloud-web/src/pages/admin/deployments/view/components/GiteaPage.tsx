import { useDeployment, useUpdateDeployment } from '@hooks/admin/deployments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { CompactSwitch } from '@vritti/quantum-ui/Switch';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Activity, GitBranch } from 'lucide-react';
import { useDeploymentAgent } from '@/providers/AgentStreamProvider';
import { servicesForComponent } from '@/schemas/admin/deployments';
import { LogStream } from './LogStream';
import { ServicesTable } from './ServicesTable';

function giteaHost(url: string): string {
  try {
    return `git.${new URL(url).host}`;
  } catch {
    return 'git.<base>';
  }
}

// The Gitea component: a post-setup opt-in. Toggling the switch PATCHes the spec's gitea component,
// bumping the generation for the agent to provision (or tear down) the bundled Git server.
export const GiteaPage = () => {
  const { id } = useSlugParams('deploymentSlug');
  const { data: deployment } = useDeployment(id);
  const agent = useDeploymentAgent();

  const enabled = !!deployment.spec.components.gitea?.enabled;
  const services = servicesForComponent(agent.services, 'gitea');
  const logTargets = services.map((s) => ({ value: s.service, label: s.service }));
  const host = giteaHost(deployment.url);

  const mutation = useUpdateDeployment();
  const toggle = (next: boolean) =>
    mutation.mutate({ id: deployment.id, data: { components: { gitea: { enabled: next } } } });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Gitea" description="Optional bundled Git server for this deployment." />

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GitBranch className="size-5" />
              </div>
              <div className="space-y-1">
                <CardTitle>Gitea server</CardTitle>
                <CardDescription>Bundled Git server at {host} (SSH on :2222).</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{enabled ? 'Enabled' : 'Disabled'}</span>
              <CompactSwitch checked={enabled} disabled={mutation.isPending} onCheckedChange={toggle} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {enabled ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailField label="URL" type="string" value={`https://${host}`} mono />
              <DetailField label="SSH" type="string" value={`${host}:2222`} mono />
            </div>
          ) : (
            <Typography variant="body2" intent="muted">
              Enable to provision a Gitea instance and admin token. Enabling bumps the generation; the agent starts the
              container, runs the init script, and adds the <span className="font-mono">git.</span> route on its next
              reconcile.
            </Typography>
          )}
        </CardContent>
      </Card>

      {enabled && (
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
            <ServicesTable services={services} deploymentId={id} connected={agent.connected} emptyText="Provisioning — the gitea service will appear here shortly." />
          </CardContent>
        </Card>
      )}

      {enabled && logTargets.length > 0 && (
        <LogStream
          deploymentId={id}
          targets={logTargets}
          connected={agent.connected}
          title="Gitea logs"
          description="Tail the Gitea container in real time."
        />
      )}
    </div>
  );
};
