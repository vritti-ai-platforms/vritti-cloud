import {
  useDisableApp,
  useEnableApp,
  useOrgApps,
  usePurchaseAddon,
} from '@hooks/cloud/org-apps';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { Layers } from 'lucide-react';
import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import type { OrgApp } from '@/schemas/cloud/org-apps';
import { AddonPurchaseDialog } from './components/AddonPurchaseDialog';
import { AppCard } from './components/AppCard';

export const OrgAppsPage = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';

  const { data: response, isLoading } = useOrgApps(orgId);
  const apps = response?.result ?? [];

  const confirm = useConfirm();
  const purchaseDialog = useDialog();
  const purchaseAppRef = useRef<OrgApp | null>(null);

  const enableMutation = useEnableApp();
  const disableMutation = useDisableApp();
  const purchaseMutation = usePurchaseAddon();

  // Toggles an included app on or off with confirmation for disable
  async function handleToggle(app: OrgApp) {
    if (app.status === 'enabled') {
      const confirmed = await confirm({
        title: `Disable ${app.name}?`,
        description: 'Users in this organization will lose access to this application.',
        confirmLabel: 'Disable',
        variant: 'destructive',
      });
      if (confirmed) disableMutation.mutate({ orgId, appId: app.id });
    } else {
      enableMutation.mutate({ orgId, appId: app.id });
    }
  }

  // Opens the purchase dialog for an addon app
  function handlePurchase(app: OrgApp) {
    purchaseAppRef.current = app;
    purchaseDialog.open();
  }

  // Confirms addon purchase for selected business units
  function handlePurchaseConfirm(businessUnitIds: string[]) {
    if (!purchaseAppRef.current) return;
    purchaseMutation.mutate(
      { orgId, appId: purchaseAppRef.current.id, data: { businessUnitIds } },
      { onSuccess: () => purchaseDialog.close() },
    );
  }

  // Group apps by status for display ordering
  const includedApps = apps.filter((a) => a.status === 'included');
  const addonApps = apps.filter((a) => a.status === 'addon');
  const unavailableApps = apps.filter((a) => a.status === 'unavailable');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Applications"
        description="Manage the applications available to your organization"
      />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`skeleton-${i.toString()}`} className="h-32 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && apps.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Layers className="size-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">No applications available</p>
          <p className="text-xs text-muted-foreground mt-1">
            Applications will appear here once your plan is configured.
          </p>
        </div>
      )}

      {/* Included apps */}
      {includedApps.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Included in your plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {includedApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onToggle={handleToggle}
                onPurchase={handlePurchase}
                isToggling={
                  (enableMutation.isPending || disableMutation.isPending) &&
                  (enableMutation.variables?.appId === app.id ||
                    disableMutation.variables?.appId === app.id)
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Addon apps */}
      {addonApps.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Available add-ons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addonApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onToggle={handleToggle}
                onPurchase={handlePurchase}
                isToggling={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Unavailable apps */}
      {unavailableApps.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Not available</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unavailableApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onToggle={handleToggle}
                onPurchase={handlePurchase}
                isToggling={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Purchase dialog */}
      <Dialog
        handle={purchaseDialog}
        title={`Purchase ${purchaseAppRef.current?.name ?? 'Add-on'}`}
        description="Select the business units where you want to activate this application."
        content={(close) =>
          purchaseAppRef.current ? (
            <AddonPurchaseDialog
              app={purchaseAppRef.current}
              orgId={orgId}
              onConfirm={handlePurchaseConfirm}
              onCancel={close}
              isPending={purchaseMutation.isPending}
            />
          ) : null
        }
      />
    </div>
  );
};
