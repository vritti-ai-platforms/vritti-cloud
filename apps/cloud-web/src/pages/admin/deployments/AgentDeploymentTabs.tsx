import { useAgentStatus, useDeleteDeployment } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import type { AgentStatus, Deployment } from '@/schemas/admin/deployments';
import { HostMetricsSummary } from './components/HostMetricsSummary';
import { AgentTab } from './tabs/AgentTab';
import { CatalogTab } from './tabs/CatalogTab';
import { CoreStackTab } from './tabs/CoreStackTab';
import { DatabaseTab } from './tabs/DatabaseTab';
import { EdgeTab } from './tabs/EdgeTab';
import { GiteaTab } from './tabs/GiteaTab';
import { OverviewTab } from './tabs/OverviewTab';
import { SecretStoreTab } from './tabs/SecretStoreTab';
import { SigningKeyTab } from './tabs/SigningKeyTab';

interface AgentDeploymentTabsProps {
  deployment: Deployment;
  agent: AgentStatus;
  id: string;
}

export const AgentDeploymentTabs: React.FC<AgentDeploymentTabsProps> = ({ deployment, agent: initialAgent, id }) => {
  const navigate = useNavigate();
  const confirm = useConfirm();

  // Live agent status for the header resource pills + the Agent tab; poll every 15s.
  const { data: liveAgent } = useAgentStatus(deployment.id, { refetchInterval: 15000 });
  const agent = liveAgent ?? initialAgent;

  const deleteMutation = useDeleteDeployment({
    onSuccess: () => navigate('/deployments'),
  });

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: `Delete ${deployment.name}?`,
      description: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(id);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={deployment.name}
        titleSlot={<Badge variant="secondary">Managed</Badge>}
        description={deployment.tenantType}
        actions={<HostMetricsSummary host={agent.host} />}
      />

      <Tabs
        defaultValue="overview"
        tabs={[
          { value: 'overview', label: 'Overview', content: <OverviewTab deployment={deployment} /> },
          { value: 'core-stack', label: 'Core Stack', content: <CoreStackTab deployment={deployment} /> },
          { value: 'database', label: 'Database', content: <DatabaseTab deployment={deployment} /> },
          { value: 'edge', label: 'Edge & TLS', content: <EdgeTab deployment={deployment} /> },
          { value: 'gitea', label: 'Gitea', content: <GiteaTab deployment={deployment} /> },
          { value: 'secret-store', label: 'Secret Store', content: <SecretStoreTab deployment={deployment} /> },
          { value: 'agent', label: 'Agent', content: <AgentTab deployment={deployment} agent={agent} /> },
          { value: 'signing-key', label: 'Signing Key', content: <SigningKeyTab deployment={deployment} /> },
          { value: 'catalog', label: 'Catalog', content: <CatalogTab deployment={deployment} /> },
        ]}
      />

      <DangerZone
        title="Delete this deployment"
        description="This action cannot be undone."
        buttonText="Delete Deployment"
        onClick={handleDelete}
        disabled={!!deployment.organizationCount}
        warning={`This deployment is used by ${deployment.organizationCount} organization${deployment.organizationCount !== 1 ? 's' : ''}. Remove all associated organizations before deleting.`}
        showWarning={!!deployment.organizationCount}
      />
    </div>
  );
};
