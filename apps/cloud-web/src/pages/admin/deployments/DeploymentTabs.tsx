import { useDeleteDeployment } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Deployment } from '@/schemas/admin/deployments';
import { CatalogTab } from './tabs/CatalogTab';
import { OrganizationsTab } from './tabs/OrganizationsTab';
import { OverviewTab } from './tabs/OverviewTab';
import { SigningKeyTab } from './tabs/SigningKeyTab';

interface DeploymentTabsProps {
  deployment: Deployment;
  deploymentSlug: string;
  id: string;
}

export const DeploymentTabs: React.FC<DeploymentTabsProps> = ({ deployment, deploymentSlug, id }) => {
  const navigate = useNavigate();
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
        titleSlot={<Badge variant="secondary">Local</Badge>}
        description={deployment.tenantType}
      />

      <Tabs
        defaultValue="overview"
        tabs={[
          { value: 'overview', label: 'Overview', content: <OverviewTab deployment={deployment} /> },
          {
            value: 'organizations',
            label: 'Organizations',
            content: <OrganizationsTab deploymentId={id} deploymentSlug={deploymentSlug} />,
          },
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
