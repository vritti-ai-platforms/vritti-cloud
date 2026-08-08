import { useDeleteDeployment } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { pluralize } from '@vritti/quantum-ui/pluralize';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { Info } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Deployment } from '@/schemas/admin/deployments';
import { CatalogTab } from './tabs/CatalogTab';
import { LocalOverviewTab } from './tabs/LocalOverviewTab';
import { OrganizationsTab } from './tabs/OrganizationsTab';
import { SigningKeyTab } from './tabs/SigningKeyTab';

interface LocalDeploymentViewProps {
  deployment: Deployment;
  deploymentSlug: string;
  id: string;
}

// The ready manual (self-hosted) deployment: licensing surfaces only. Cloud does not run, reconcile, or
// monitor this stack — no cockpit, components, health, or host metrics.
export const LocalDeploymentView: React.FC<LocalDeploymentViewProps> = ({ deployment, deploymentSlug, id }) => {
  const navigate = useNavigate();
  const confirm = useConfirm();

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
        titleSlot={<Badge variant="secondary">Manual</Badge>}
        description={deployment.tenantType}
      />

      <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
        <Info className="size-5 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Self-hosted deployment.</span> Vritti issues the license key and
          syncs the signed catalog — it does not run, reconcile, or monitor this stack. There are no components, health,
          or host metrics to show.
        </p>
      </div>

      <Tabs
        routeParam="deploymentTab"
        defaultValue="overview"
        tabs={[
          { value: 'overview', label: 'Overview', content: <LocalOverviewTab deployment={deployment} /> },
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
        warning={`This deployment is used by ${pluralize('organization', deployment.organizationCount, true)}. Remove all associated organizations before deleting.`}
        showWarning={!!deployment.organizationCount}
      />
    </div>
  );
};
