import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { Blocks, Database, GitBranch, Lock } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import type { AgentStatus, Deployment } from '@/schemas/admin/deployments';
import { servicesForComponent } from '@/schemas/admin/deployments';
import { rollupHealth } from '../components/ServicesTable';
import { ComponentCard } from './ComponentCard';

interface ComponentGridProps {
  deployment: Deployment;
  agent: AgentStatus;
  deploymentSlug: string;
}

// The four stack components, each drilling into its full-page view. Enabled/health/one-fact are derived
// from the spec + the agent's reported services.
export const ComponentGrid: React.FC<ComponentGridProps> = ({ deployment, agent, deploymentSlug }) => {
  const navigate = useNavigate();
  const components = deployment.spec.components;
  const go = (segment: string) => navigate(`/deployments/${deploymentSlug}/${segment}`);

  const coreServices = servicesForComponent(agent.services, 'core');
  const dbServices = servicesForComponent(agent.services, 'database');
  const edgeServices = servicesForComponent(agent.services, 'edge');
  const giteaServices = servicesForComponent(agent.services, 'gitea');

  const dbManaged = components.database?.mode === 'managed';
  const backupsOn = !!components.database?.backup;
  const edgeManaged = components.edge?.mode === 'managed';
  const cert = agent.certificates[0];
  const certDays = cert ? Math.ceil((new Date(cert.notAfter).getTime() - Date.now()) / 86_400_000) : null;
  const giteaEnabled = !!components.gitea?.enabled;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Blocks className="size-5" />
          </div>
          <div className="space-y-1">
            <CardTitle>Components</CardTitle>
            <CardDescription>Open a component to configure it and see its live health.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ComponentCard
            icon={Blocks}
            name="Core stack"
            subtitle="core-server · commerce · nats · redis · web"
            fact={`${coreServices.length} service${coreServices.length === 1 ? '' : 's'} running`}
            enabled
            health={rollupHealth(coreServices)}
            onClick={() => go('core-stack')}
          />
          <ComponentCard
            icon={Database}
            name="Database"
            subtitle={`${dbManaged ? 'Managed' : 'External'} · backups ${backupsOn ? 'on' : 'off'}`}
            fact={
              dbManaged
                ? backupsOn
                  ? 'pgBackRest enabled'
                  : 'pgBackRest available to enable'
                : 'Connected via secret store'
            }
            enabled
            health={rollupHealth(dbServices)}
            onClick={() => go('database')}
          />
          <ComponentCard
            icon={Lock}
            name="Edge & TLS"
            subtitle={edgeManaged ? 'Managed · nginx + ACME' : 'External proxy'}
            fact={
              edgeManaged
                ? certDays != null
                  ? `${edgeServices.length} service${edgeServices.length === 1 ? '' : 's'} · cert valid ${certDays}d`
                  : 'Awaiting wildcard certificate'
                : 'TLS handled outside the agent'
            }
            enabled
            health={rollupHealth(edgeServices)}
            onClick={() => go('edge')}
          />
          <ComponentCard
            icon={GitBranch}
            name="Gitea"
            subtitle={giteaEnabled ? 'Enabled · self-hosted Git' : 'Disabled — available to enable'}
            fact={giteaEnabled ? 'Served at git.<base>' : 'Run a bundled Git server at git.<base>'}
            enabled={giteaEnabled}
            health={rollupHealth(giteaServices)}
            onClick={() => go('gitea')}
          />
        </div>
      </CardContent>
    </Card>
  );
};
