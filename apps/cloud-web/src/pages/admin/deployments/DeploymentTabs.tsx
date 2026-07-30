import {
  deploymentQueryKey,
  useDeleteDeployment,
  useRegenerateSigningKey,
  useSyncDeploymentCatalog,
} from '@hooks/admin/deployments';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { CopyField } from '@vritti/quantum-ui/CopyField';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { Typography } from '@vritti/quantum-ui/Typography';
import { AlertTriangle, Blocks, CheckCircle2, KeyRound, RefreshCw, Server, ShieldCheck } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Deployment, DeploymentSigningKey } from '@/schemas/admin/deployments';
import { SigningKeyReveal } from './components/SigningKeyReveal';
import { EditDeploymentForm } from './forms/EditDeploymentForm';
import { OrganizationsTab } from './tabs/OrganizationsTab';

interface DeploymentTabsProps {
  deployment: Deployment;
  deploymentSlug: string;
  id: string;
}

const DEPLOYMENT_STATUS_VARIANT: Record<Deployment['status'], 'success' | 'warning' | 'secondary'> = {
  active: 'success',
  provisioning: 'warning',
  stopped: 'secondary',
};

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const DeploymentTabs: React.FC<DeploymentTabsProps> = ({ deployment, deploymentSlug, id }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editDialog = useDialog();
  const confirm = useConfirm();

  const [signingKey, setSigningKey] = useState<DeploymentSigningKey | null>(null);

  const invalidateDeployment = () => queryClient.invalidateQueries({ queryKey: deploymentQueryKey(id) });

  const deleteMutation = useDeleteDeployment({
    onSuccess: () => navigate('/deployments'),
  });

  const regenerateMutation = useRegenerateSigningKey({
    onSuccess: (response) => {
      setSigningKey(response.data);
      invalidateDeployment();
    },
  });

  const syncCatalogMutation = useSyncDeploymentCatalog({
    onSuccess: () => invalidateDeployment(),
  });

  const handleRegenerateSigningKey = async () => {
    const confirmed = await confirm({
      title: 'Regenerate signing key?',
      description:
        "The current key stops verifying immediately — signed licenses and entitlements will fail until the core deployment's LICENSE_PUBLIC_KEY env is updated and the deployment is resynced.",
      confirmLabel: 'Regenerate',
      variant: 'destructive',
    });
    if (confirmed) regenerateMutation.mutate(id);
  };

  const handleSyncCatalog = async () => {
    const confirmed = await confirm({
      title: 'Sync catalog?',
      description: "Re-push the feature catalog to this deployment's core?",
      confirmLabel: 'Sync Catalog',
    });
    if (confirmed) syncCatalogMutation.mutate(id);
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
        titleSlot={<Badge variant="secondary">Local</Badge>}
        description={deployment.type}
        actions={
          <Button variant="outline" size="sm" onClick={editDialog.open}>
            Edit
          </Button>
        }
      />

      <Tabs
        defaultValue="overview"
        tabs={[
          {
            value: 'overview',
            label: 'Overview',
            content: (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Server className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle>Deployment details</CardTitle>
                      <CardDescription>
                        Connection endpoints and runtime configuration for this deployment.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Connection</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <CopyField label="Endpoint URL" value={deployment.url} />
                      <CopyField label="Deployment ID" description="DEPLOYMENT_ID" value={deployment.id} />
                    </div>
                  </div>
                  <div className="space-y-4 border-t pt-6">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Details</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <DetailField label="Version" type="string" value={deployment.version} mono />
                      <DetailField
                        label="Status"
                        type="string"
                        value={
                          <Badge variant={DEPLOYMENT_STATUS_VARIANT[deployment.status]}>
                            {titleCase(deployment.status)}
                          </Badge>
                        }
                      />
                      <DetailField label="Type" type="string" value={titleCase(deployment.type)} />
                      <DetailField label="Management Mode" type="string" value={titleCase(deployment.managementMode)} />
                      <DetailField label="Organizations" type="number" value={deployment.organizationCount ?? 0} />
                      <DetailField label="Created" type="date" value={deployment.createdAt} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ),
          },
          {
            value: 'organizations',
            label: 'Organizations',
            content: <OrganizationsTab deploymentId={id} deploymentSlug={deploymentSlug} />,
          },
          {
            value: 'signing-key',
            label: 'Signing Key',
            content: (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <KeyRound className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle>License signing key</CardTitle>
                        <CardDescription>
                          The keypair core uses to verify signed licenses and entitlements.
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={deployment.hasSigningKey ? 'success' : 'secondary'}>
                      {deployment.hasSigningKey ? 'Generated' : 'Not generated'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
                    {deployment.hasSigningKey ? (
                      <ShieldCheck className="size-5 shrink-0 text-success" />
                    ) : (
                      <KeyRound className="size-5 shrink-0 text-muted-foreground" />
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {deployment.hasSigningKey ? 'Keypair active' : 'No keypair generated'}
                      </p>
                      <Typography variant="body2" intent="muted">
                        The public key is shown only once at generation. Regenerating rotates the keypair — the current
                        key stops verifying immediately, so core must be updated with the new LICENSE_PUBLIC_KEY and
                        resynced.
                      </Typography>
                    </div>
                  </div>
                  {signingKey && <SigningKeyReveal signingKey={signingKey} showResyncNote />}
                </CardContent>
                <CardFooter className="justify-between gap-4 border-t">
                  <Typography variant="body2" intent="muted">
                    Only regenerate if the current key was lost or needs rotation.
                  </Typography>
                  <Button
                    variant="outline"
                    onClick={handleRegenerateSigningKey}
                    isLoading={regenerateMutation.isPending}
                    loadingText="Regenerating..."
                    startAdornment={<KeyRound className="size-4" />}
                  >
                    Regenerate Signing Key
                  </Button>
                </CardFooter>
              </Card>
            ),
          },
          {
            value: 'catalog',
            label: 'Catalog',
            content: (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Blocks className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle>Feature catalog</CardTitle>
                        <CardDescription>The signed feature catalog pushed to this deployment's core.</CardDescription>
                      </div>
                    </div>
                    <Badge variant={deployment.catalogSynced ? 'success' : 'secondary'}>
                      {deployment.catalogSynced ? 'Synced' : 'Not synced'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
                    {deployment.catalogSynced ? (
                      <CheckCircle2 className="size-5 shrink-0 text-success" />
                    ) : (
                      <AlertTriangle className="size-5 shrink-0 text-warning" />
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {deployment.catalogSynced ? 'Catalog in sync' : 'Catalog out of sync'}
                      </p>
                      <Typography variant="body2" intent="muted">
                        {deployment.catalogSynced
                          ? 'Core is running the latest signed feature catalog.'
                          : 'Push the latest feature catalog so core resolves current entitlements.'}
                      </Typography>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DetailField label="Version" type="string" value={deployment.version} mono />
                    <DetailField
                      label="Last Pushed Hash"
                      type="string"
                      value={deployment.lastPushedHash ? deployment.lastPushedHash.slice(0, 12) : null}
                      mono
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-between gap-4 border-t">
                  <Typography variant="body2" intent="muted">
                    Re-push the catalog to sync core with the latest features.
                  </Typography>
                  <Button
                    variant="outline"
                    onClick={handleSyncCatalog}
                    isLoading={syncCatalogMutation.isPending}
                    loadingText="Syncing..."
                    startAdornment={<RefreshCw className="size-4" />}
                  >
                    Sync Catalog
                  </Button>
                </CardFooter>
              </Card>
            ),
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
        description="Update the details for this deployment."
        content={(close) => <EditDeploymentForm deployment={deployment} onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};
