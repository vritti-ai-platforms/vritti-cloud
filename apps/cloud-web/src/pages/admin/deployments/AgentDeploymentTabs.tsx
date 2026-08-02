import { useDeleteDeployment } from '@hooks/admin/deployments';
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
import { EditDeploymentForm } from './forms/EditDeploymentForm';
import { AgentTab } from './tabs/AgentTab';
import { CatalogTab } from './tabs/CatalogTab';
import { OverviewTab } from './tabs/OverviewTab';
import { SigningKeyTab } from './tabs/SigningKeyTab';

interface AgentDeploymentTabsProps {
  deployment: Deployment;
  agent: AgentStatus;
  id: string;
}

export const AgentDeploymentTabs: React.FC<AgentDeploymentTabsProps> = ({ deployment, agent, id }) => {
  const navigate = useNavigate();
  const editDialog = useDialog();
  const confirm = useConfirm();

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
        actions={
          <Button variant="outline" size="sm" onClick={editDialog.open}>
            Edit
          </Button>
        }
      />

      <Tabs
        defaultValue="overview"
        tabs={[
          { value: 'overview', label: 'Overview', content: <OverviewTab deployment={deployment} /> },
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

      <Dialog
        handle={editDialog}
        icon={Server}
        title="Edit Deployment"
        description="Update the details for this deployment."
        content={(close) => <EditDeploymentForm deployment={deployment} onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};
