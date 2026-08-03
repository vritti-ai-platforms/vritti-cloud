import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Boxes } from 'lucide-react';
import type React from 'react';
import type { Deployment } from '@/schemas/admin/deployments';

interface StackService {
  name: string;
  role: string;
  // Whether this piece is always present, or conditional on a deployment setting.
  present: boolean;
  note?: string;
}

interface CoreStackTabProps {
  deployment: Deployment;
}

export const CoreStackTab: React.FC<CoreStackTabProps> = ({ deployment }) => {
  const services: StackService[] = [
    { name: 'core-server', role: 'HTTP API', present: true },
    { name: 'commerce-service', role: 'microservice (NATS)', present: true },
    { name: 'nats', role: 'message bus', present: true },
    { name: 'redis', role: 'cache', present: true },
    { name: 'core-web + microfrontends', role: 'static SPA (served on *.<base>)', present: true },
    {
      name: 'postgres',
      role: 'managed database',
      present: deployment.mode === 'managed',
      note: 'Database = managed',
    },
    { name: 'nginx', role: 'edge + TLS', present: deployment.edge === 'managed', note: 'Edge = managed' },
    { name: 'gitea', role: 'self-hosted Git', present: deployment.addonGitea, note: 'Gitea enabled' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Boxes className="size-5" />
          </div>
          <div className="space-y-1">
            <CardTitle>Core stack</CardTitle>
            <CardDescription>
              The services the agent runs for this deployment (version {deployment.version}).
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {services.map((svc) => (
            <div key={svc.name} className="flex items-center gap-3 py-2.5">
              <span
                className={`size-2 shrink-0 rounded-full ${svc.present ? 'bg-success' : 'bg-muted-foreground/40'}`}
              />
              <span className="text-sm font-medium">{svc.name}</span>
              <span className="ml-auto text-sm text-muted-foreground">
                {svc.present ? svc.role : `added when ${svc.note}`}
              </span>
            </div>
          ))}
        </div>
        <Typography variant="body2" intent="muted" className="mt-4">
          This is the fixed stack — the Database, Edge & TLS, and Gitea tabs decide which optional pieces are added.
        </Typography>
      </CardContent>
    </Card>
  );
};
