import { useAddCloudProvider, useDeleteRegion, useRegion, useRemoveCloudProvider } from '@hooks/admin/regions';
import { cn } from '@vritti/quantum-ui';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { Empty } from '@vritti/quantum-ui/Empty';
import { useConfirm, useDialog, useSlugParams, useTheme } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { DollarSign, Layers, Link2, Link2Off, Server, ServerOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EditRegionForm } from './forms/EditRegionForm';

export const RegionViewPage = () => {
  const { id } = useSlugParams('regionSlug');
  const navigate = useNavigate();

  const editDialog = useDialog();
  const confirm = useConfirm();

  const { theme } = useTheme();
  const { data: region } = useRegion(id);

  const deleteMutation = useDeleteRegion({
    onSuccess: () => navigate('/regions'),
  });

  const addProviderMutation = useAddCloudProvider();
  const removeProviderMutation = useRemoveCloudProvider();

  // Providers are now embedded in the region response with isAssigned flag
  const allProviders = region.providers ?? [];

  // Toggle a cloud provider on or off for this region
  const handleProviderToggle = (providerId: string, enabled: boolean) => {
    if (!id) return;
    if (enabled) {
      addProviderMutation.mutate({ regionId: id, providerId });
    } else {
      removeProviderMutation.mutate({ regionId: id, providerId });
    }
  };

  // Prompt confirmation then delete
  const handleDelete = async () => {
    if (!id) return;
    const confirmed = await confirm({
      title: `Delete ${region.name}?`,
      description: `${region.name} and all its associated data will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(id);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title={region.name}
        description={`${region.city}, ${region.state}, ${region.country} — ${region.code}`}
        actions={
          <Button variant="outline" size="sm" onClick={editDialog.open}>
            Edit
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Server className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Providers</p>
              <p className="text-2xl font-semibold">{region.providerCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deployments</p>
              <p className="text-2xl font-semibold">{region.deploymentCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prices</p>
              <p className="text-2xl font-semibold">{region.priceCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cloud Providers card */}
      <Card>
        <CardHeader>
          <CardTitle>Cloud Providers</CardTitle>
          <CardDescription>Toggle which cloud providers are available in this region.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-48">
          {allProviders.length === 0 ? (
            <Empty
              icon={<ServerOff />}
              title="No cloud providers"
              description="No cloud providers have been configured yet. Add a provider to assign it to this region."
              action={
                <Button size="sm" onClick={() => navigate('/cloud-providers')}>
                  Add Provider
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              {allProviders.map((provider) => {
                const isPending =
                  (addProviderMutation.isPending && addProviderMutation.variables?.providerId === provider.id) ||
                  (removeProviderMutation.isPending && removeProviderMutation.variables?.providerId === provider.id);

                return (
                  <div
                    key={provider.id}
                    className={cn(
                      'flex items-center justify-between px-3 rounded-xl border h-[69px]',
                      provider.isAssigned ? 'bg-primary/5 border-primary/30' : 'border-border',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={theme === 'dark' ? (provider.logoDarkUrl ?? provider.logoUrl) : provider.logoUrl}
                        alt={provider.name}
                        className="size-9 object-contain"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm">{provider.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {provider.code}
                          </Badge>
                          {!!provider.deploymentCount && (
                            <Badge variant="secondary">
                              {provider.deploymentCount} deployment{provider.deploymentCount !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={provider.isAssigned ? 'default' : 'outline'}
                      size="sm"
                      isLoading={isPending}
                      loadingText={provider.isAssigned ? 'Removing' : 'Adding'}
                      startAdornment={
                        provider.isAssigned ? <Link2Off className="size-4" /> : <Link2 className="size-4" />
                      }
                      className="min-w-24"
                      onClick={() => handleProviderToggle(provider.id, !provider.isAssigned)}
                    >
                      {provider.isAssigned ? 'Remove' : 'Add'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <DangerZone
        title="Delete this region"
        description="This action cannot be undone. All associated data will be permanently removed."
        buttonText="Delete Region"
        onClick={handleDelete}
        disabled={!region.canDelete}
        warning={
          !region.canDelete
            ? `This region has ${region.deploymentCount} deployment(s) and ${region.priceCount} price(s) associated with it. Remove all deployments and prices before deleting.`
            : undefined
        }
      />

      {/* Edit dialog */}
      <Dialog
        handle={editDialog}
        title="Edit Region"
        description="Update the details for this region."
        content={(close) => <EditRegionForm region={region} onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};
