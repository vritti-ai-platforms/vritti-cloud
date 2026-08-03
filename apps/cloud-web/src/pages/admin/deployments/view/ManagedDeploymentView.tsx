import { useAgentStatus, useDeleteDeployment } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { Server } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import type { AgentStatus, Deployment } from '@/schemas/admin/deployments';
import { HostMetricsSummary } from '../components/HostMetricsSummary';
import { DeploymentCockpit } from './cockpit/DeploymentCockpit';
import { EditDeploymentDetailsForm } from './EditDeploymentDetailsForm';
import { AgentTab } from './tabs/AgentTab';
import { CatalogTab } from './tabs/CatalogTab';
import { OrganizationsTab } from './tabs/OrganizationsTab';
import { SigningKeyTab } from './tabs/SigningKeyTab';

interface ManagedDeploymentViewProps {
  deployment: Deployment;
  agent: AgentStatus;
  deploymentSlug: string;
  id: string;
}

// The ready managed deployment: a <Tabs> shell of control-plane surfaces. The four stack components are
// full-page views drilled from the Overview cockpit, not tabs.
export const ManagedDeploymentView: React.FC<ManagedDeploymentViewProps> = ({
  deployment,
  agent: initialAgent,
  deploymentSlug,
  id,
}) => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const editDialog = useDialog();

  // Live agent status for the header resource pills + cockpit; poll every 15s.
  const { data: liveAgent } = useAgentStatus(deployment.id, { refetchInterval: 15000 });
  const agent = liveAgent ?? initialAgent;

  const deleteMutation = useDeleteDeployment({ onSuccess: () => navigate('/deployments') });

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
        actions={
          <>
            <HostMetricsSummary host={agent.host} />
            <Button variant="outline" size="sm" onClick={editDialog.open}>
              Edit
            </Button>
          </>
        }
      />

      <Tabs
        defaultValue="overview"
        tabs={[
          {
            value: 'overview',
            label: 'Overview',
            content: <DeploymentCockpit deployment={deployment} agent={agent} deploymentSlug={deploymentSlug} />,
          },
          { value: 'agent', label: 'Agent', content: <AgentTab deployment={deployment} agent={agent} /> },
          { value: 'signing-key', label: 'Signing Key', content: <SigningKeyTab deployment={deployment} /> },
          { value: 'catalog', label: 'Catalog', content: <CatalogTab deployment={deployment} /> },
          {
            value: 'organizations',
            label: 'Organizations',
            content: <OrganizationsTab deploymentId={id} deploymentSlug={deploymentSlug} />,
          },
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

      <Dialog
        handle={editDialog}
        icon={Server}
        title="Edit Deployment"
        description="Update this deployment's connection and runtime details."
        content={(close) => <EditDeploymentDetailsForm deployment={deployment} onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};
