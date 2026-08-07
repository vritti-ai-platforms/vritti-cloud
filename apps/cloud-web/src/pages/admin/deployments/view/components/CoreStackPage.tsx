import { useDeployment } from '@hooks/admin/deployments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Blocks } from 'lucide-react';
import { useDeploymentAgent } from '@/providers/AgentStreamProvider';
import { servicesForComponent } from '@/schemas/admin/deployments';
import { LogStream } from './LogStream';
import { ServicesTable } from './ServicesTable';

// Read-only view of the fixed core stack the agent runs, with live per-service health.
export const CoreStackPage = () => {
  const { id } = useSlugParams('deploymentSlug');
  const { data: deployment } = useDeployment(id);
  const agent = useDeploymentAgent();

  const services = servicesForComponent(agent.services, 'core');
  const logTargets = services.map((s) => ({ value: s.service, label: s.service }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Core Stack"
        description={`The fixed stack the agent runs for this deployment (${deployment.version ?? 'latest'}).`}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Blocks className="size-5" />
            </div>
            <div className="space-y-1">
              <CardTitle>Services</CardTitle>
              <CardDescription>core-server · commerce-service · nats · redis · core-web. Read-only.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ServicesTable services={services} deploymentId={id} connected={agent.connected} />
          <Typography variant="body2" intent="muted">
            This is the fixed stack — the Database, Edge &amp; TLS, and Gitea components decide which optional pieces
            are added.
          </Typography>
        </CardContent>
      </Card>

      {logTargets.length > 0 && (
        <LogStream
          deploymentId={id}
          targets={logTargets}
          connected={agent.connected}
          title="Service logs"
          description="Tail any core service’s container in real time."
        />
      )}
    </div>
  );
};
