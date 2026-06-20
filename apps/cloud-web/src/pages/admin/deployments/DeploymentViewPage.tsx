import { useDeleteDeployment, useDeployment } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog, useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { Server } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { EditDeploymentForm } from './forms/EditDeploymentForm';
import { OrganizationsTab } from './tabs/OrganizationsTab';

export const DeploymentViewPage = () => {
  const { id } = useSlugParams('deploymentSlug');
  const { deploymentSlug } = useParams();
  const navigate = useNavigate();

  const editDialog = useDialog();
  const confirm = useConfirm();

  const { data: deployment } = useDeployment(id ?? '');

  const deleteMutation = useDeleteDeployment({
    onSuccess: () => navigate('/deployments'),
  });

  // Prompt confirmation then delete
  const handleDelete = async () => {
    if (!id) return;
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
        description={deployment.type}
        actions={
          <Button variant="outline" size="sm" onClick={editDialog.open}>
            Edit
          </Button>
        }
      />

      {/* Tabs */}
      <Tabs
        defaultValue="overview"
        contentClassName="min-h-[400px]"
        tabs={[
          {
            value: 'overview',
            label: 'Overview',
            content: (
              <div className="flex flex-col gap-6">
                <Card>
                  <CardContent className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-2">
                    <DetailField label="URL" type="string" value={deployment.url} mono />
                    <DetailField label="Version" type="string" value={deployment.version ?? '—'} mono />
                    <DetailField label="Region" type="string" value={deployment.regionName ?? '—'} />
                    <DetailField label="Cloud Provider" type="string" value={deployment.cloudProviderName ?? '—'} />
                    <DetailField
                      label="Status"
                      type="string"
                      value={<Badge variant="secondary">{deployment.status}</Badge>}
                    />
                    <DetailField label="Organizations" type="number" value={deployment.organizationCount ?? 0} />
                  </CardContent>
                </Card>

                <DangerZone
                  title="Delete this deployment"
                  description="This action cannot be undone."
                  buttonText="Delete Deployment"
                  onClick={handleDelete}
                  disabled={!!deployment.organizationCount}
                  warning={
                    deployment.organizationCount
                      ? `This deployment is used by ${deployment.organizationCount} organization${deployment.organizationCount !== 1 ? 's' : ''}. Remove all associated organizations before deleting.`
                      : undefined
                  }
                />
              </div>
            ),
          },
          {
            value: 'organizations',
            label: 'Organizations',
            content: <OrganizationsTab deploymentId={id ?? ''} deploymentSlug={deploymentSlug ?? ''} />,
          },
        ]}
      />

      {/* Edit dialog */}
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
