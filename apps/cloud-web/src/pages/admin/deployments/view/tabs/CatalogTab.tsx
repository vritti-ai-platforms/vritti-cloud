import { deploymentQueryKey, useSyncDeploymentCatalog } from '@hooks/admin/deployments';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { Typography } from '@vritti/quantum-ui/Typography';
import { AlertTriangle, Blocks, CheckCircle2, RefreshCw } from 'lucide-react';
import type React from 'react';
import type { Deployment } from '@/schemas/admin/deployments';

interface CatalogTabProps {
  deployment: Deployment;
}

export const CatalogTab: React.FC<CatalogTabProps> = ({ deployment }) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const syncCatalogMutation = useSyncDeploymentCatalog({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: deploymentQueryKey(deployment.id) }),
  });

  const handleSyncCatalog = async () => {
    const confirmed = await confirm({
      title: 'Sync catalog?',
      description: "Re-push the feature catalog to this deployment's core?",
      confirmLabel: 'Sync Catalog',
    });
    if (confirmed) syncCatalogMutation.mutate(deployment.id);
  };

  return (
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
  );
};
