import { useAppPrices, useRemoveAppPrice } from '@hooks/admin/apps';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { Cloud, DollarSign, Globe, Plus, Trash2 } from 'lucide-react';
import { useVersionContext } from '@/hooks/admin/app-versions/useVersionContext';
import type { AppPrice } from '@/schemas/admin/apps';
import { AddAppPriceForm } from '../forms/AddAppPriceForm';

// Pricing tab — list addon prices with remove + add dialog
export const PricingTab = ({ appId }: { appId: string }) => {
  const { versionId } = useVersionContext();
  const { data: prices = [], isLoading } = useAppPrices(versionId, appId);
  const confirm = useConfirm();
  const removeMutation = useRemoveAppPrice();

  async function handleRemove(price: AppPrice) {
    const confirmed = await confirm({
      title: 'Remove this price?',
      description: `Price for ${price.regionName} / ${price.providerName} will be permanently removed.`,
      confirmLabel: 'Remove',
      variant: 'destructive',
    });
    if (confirmed) removeMutation.mutate({ versionId, appId, priceId: price.id });
  }

  if (isLoading) {
    return (
      <div className="border rounded-lg divide-y pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-4 min-h-[200px]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{prices.length} price(s) configured</p>
        <Dialog
          title="Add Price"
          description="Set a price for a region and cloud provider combination."
          anchor={(open) => (
            <Button size="sm" startAdornment={<Plus className="size-4" />} onClick={open}>
              Add Price
            </Button>
          )}
          content={(close) => <AddAppPriceForm appId={appId} onSuccess={close} onCancel={close} />}
        />
      </div>

      {prices.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <DollarSign className="size-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">No prices configured</p>
            <p className="text-xs text-muted-foreground mt-1">Add addon pricing per region and provider.</p>
          </CardContent>
        </Card>
      )}

      {prices.length > 0 && (
        <div className="border rounded-lg divide-y">
          {prices.map((price) => (
            <div key={price.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-muted-foreground" />
                  <span className="text-sm">{price.regionName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud className="size-4 text-muted-foreground" />
                  <span className="text-sm">{price.providerName}</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant="outline">{price.currency}</Badge>
                  <span className="text-sm font-semibold">{price.monthlyPrice}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-destructive hover:text-destructive shrink-0 ml-2"
                onClick={() => handleRemove(price)}
                disabled={removeMutation.isPending}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
