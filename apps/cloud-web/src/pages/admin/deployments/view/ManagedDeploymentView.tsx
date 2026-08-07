import { useDeleteDeployment, useStartDeployment, useStopDeployment } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { Play, Power, Server } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeploymentAgent } from '@/providers/AgentStreamProvider';
import type { Deployment } from '@/schemas/admin/deployments';
import { DeploymentCockpit } from './cockpit/DeploymentCockpit';
import { EditDeploymentDetailsForm } from './EditDeploymentDetailsForm';
import { ActivityTab } from './tabs/ActivityTab';
import { AgentTab } from './tabs/AgentTab';
import { CatalogTab } from './tabs/CatalogTab';
import { OrganizationsTab } from './tabs/OrganizationsTab';
import { SigningKeyTab } from './tabs/SigningKeyTab';

interface ManagedDeploymentViewProps {
  deployment: Deployment;
  deploymentSlug: string;
  id: string;
}

// The ready managed deployment: a <Tabs> shell of control-plane surfaces. The four stack components are
// full-page views drilled from the Overview cockpit, not tabs.
export const ManagedDeploymentView: React.FC<ManagedDeploymentViewProps> = ({ deployment, deploymentSlug, id }) => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const editDialog = useDialog();

  // Live agent status for the header resource pills + cockpit — streamed via the AgentStreamProvider (SSE).
  const agent = useDeploymentAgent();

  const deleteMutation = useDeleteDeployment({ onSuccess: () => navigate('/deployments') });
  const stopMutation = useStopDeployment();
  const startMutation = useStartDeployment();

  const handleStop = async () => {
    const confirmed = await confirm({
      title: `Stop ${deployment.name}?`,
      description:
        'This takes the whole deployment offline — every service stops. The VM data is preserved, so you can start it again anytime.',
      confirmLabel: 'Stop',
      variant: 'destructive',
    });
    if (confirmed) stopMutation.mutate(id);
  };

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
        titleSlot={
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Managed</Badge>
            {deployment.status === 'stopped' ? (
              <Badge variant="warning">Stopped</Badge>
            ) : deployment.status === 'Provisioning' ? (
              <Badge variant="secondary">Provisioning</Badge>
            ) : (
              <Badge variant={agent.connected ? 'success' : 'destructive'}>
                {agent.connected ? 'Online' : 'Offline'}
              </Badge>
            )}
          </div>
        }
        description={deployment.tenantType}
        actions={
          <div className="flex items-center gap-2">
            {deployment.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                startAdornment={<Power className="size-4" />}
                onClick={handleStop}
                disabled={stopMutation.isPending}
              >
                Stop
              </Button>
            )}
            {deployment.status === 'stopped' && (
              <Button
                size="sm"
                startAdornment={<Play className="size-4" />}
                onClick={() => startMutation.mutate(id)}
                disabled={startMutation.isPending}
              >
                Start
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={editDialog.open}>
              Edit
            </Button>
          </div>
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
          { value: 'activity', label: 'Activity', content: <ActivityTab deploymentId={id} /> },
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
