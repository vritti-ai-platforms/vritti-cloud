import { useBillingCycles } from '@hooks/admin/billing-cycles';
import { useDeletePrice, usePrices } from '@hooks/admin/versions/businesses/plans/prices';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card } from '@vritti/quantum-ui/Card';
import { RowActions } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog, useFormatters } from '@vritti/quantum-ui/hooks';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { DollarSign, Pencil, Plus, Trash2 } from 'lucide-react';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { PlanPrice } from '@/schemas/admin/prices';
import { AddPriceForm } from './forms/AddPriceForm';
import { EditPriceAmountForm } from './forms/EditPriceAmountForm';

interface PriceCard {
  key: string;
  countryId: string;
  countryCode: string;
  countryName: string;
  currencyCode: string;
  rows: PlanPrice[];
}

// Groups flat price rows into cards keyed by country
function groupPrices(prices: PlanPrice[]): PriceCard[] {
  const map = new Map<string, PriceCard>();
  for (const price of prices) {
    const key = price.countryId;
    let card = map.get(key);
    if (!card) {
      card = {
        key,
        countryId: price.countryId,
        countryCode: price.countryCode,
        countryName: price.countryName,
        currencyCode: price.currencyCode,
        rows: [],
      };
      map.set(key, card);
    }
    card.rows.push(price);
  }
  for (const card of map.values()) {
    card.rows.sort((a, b) => a.billingCycleDays - b.billingCycleDays);
  }
  return Array.from(map.values());
}

// Plan-level pricing — one card per country, per-cycle rows with individual edit/delete
export const PricingTab = () => {
  const { versionId, businessId, planId } = useVersionContext();
  const { data: prices = [], isLoading } = usePrices(versionId, businessId, planId);
  const addDialog = useDialog();

  if (isLoading) {
    return (
      <div className="pt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = groupPrices(prices);

  return (
    <div className="pt-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground max-w-prose">
          Each card holds this plan's prices for a country. Add prices for several billing cycles at once; edit or
          remove each cycle individually.
        </p>
        <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
          Add Price
        </Button>
      </div>

      {cards.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <DollarSign className="size-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">No prices configured</p>
          <p className="text-xs text-muted-foreground mt-1">Add your first price to get started.</p>
          <Button className="mt-4" startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
            Add Price
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <PriceCardView key={card.key} card={card} />
          ))}
        </div>
      )}

      <Dialog
        handle={addDialog}
        icon={DollarSign}
        title="Add Price"
        description="Pick a country and the billing cycles to price."
        content={(close) => <AddPriceForm onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

// One country card — its priced cycles plus an "Add cycle" affordance scoped to this country
const PriceCardView = ({ card }: { card: PriceCard }) => {
  const addCycleDialog = useDialog();
  const fmt = useFormatters();
  const { data: billingCyclesResponse } = useBillingCycles();

  const pricedCycleIds = card.rows.map((r) => r.billingCycleId);
  const totalCycles = billingCyclesResponse?.count ?? 0;
  const allCyclesPriced = totalCycles > 0 && pricedCycleIds.length >= totalCycles;
  const cycleCount = card.rows.length;

  return (
    <Card className="gap-0 overflow-hidden p-0 transition-shadow hover:shadow-md">
      {/* Header — country identity, currency, add affordance */}
      <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-semibold uppercase text-primary">
          {card.countryCode}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold leading-tight">{card.countryName}</span>
          <span className="text-xs text-muted-foreground">
            {cycleCount} {cycleCount === 1 ? 'cycle' : 'cycles'} priced
          </span>
        </div>
        <Badge variant="secondary" className="ml-auto font-mono text-[10px] tracking-wide">
          {card.currencyCode}
        </Badge>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={addCycleDialog.open}
          disabled={allCyclesPriced}
          disabledTip="Every billing cycle is already priced"
          aria-label="Add cycle price"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Cycle rows — label left, price right, actions on hover */}
      <div className="divide-y">
        {card.rows.map((price) => (
          <div
            key={price.id}
            className="group/row flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40"
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium leading-tight">{price.billingCycleName}</span>
              <span className="text-xs text-muted-foreground">{price.billingCycleDays} days</span>
            </div>
            <span className="ml-auto font-mono text-sm font-semibold tabular-nums text-foreground">
              {fmt.currency(price.amount).primary}
            </span>
            <div className="opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100">
              <PriceRowActions price={price} />
            </div>
          </div>
        ))}
      </div>

      <Dialog
        handle={addCycleDialog}
        icon={DollarSign}
        title="Add Cycle Price"
        description={`Add prices for ${card.countryName}.`}
        content={(close) => (
          <AddPriceForm
            lockedCountryId={card.countryId}
            excludeCycleIds={pricedCycleIds}
            onSuccess={close}
            onCancel={close}
          />
        )}
      />
    </Card>
  );
};

// Inline edit/delete actions for a single price row
const PriceRowActions = ({ price }: { price: PlanPrice }) => {
  const { versionId, businessId, planId } = useVersionContext();
  const confirm = useConfirm();
  const deleteMutation = useDeletePrice();
  const isDeleting = deleteMutation.isPending && deleteMutation.variables?.priceId === price.id;

  async function handleDelete() {
    const confirmed = await confirm({
      title: `Delete ${price.billingCycleName} price?`,
      description: `The ${price.billingCycleName} price for ${price.countryName} will be permanently removed.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate({ versionId, businessId, planId, priceId: price.id });
  }

  return (
    <RowActions
      actions={[
        {
          id: 'edit',
          icon: Pencil,
          label: 'Edit',
          dialog: {
            title: 'Edit Price',
            description: 'Update the amount for this billing cycle.',
            content: (close) => <EditPriceAmountForm price={price} onSuccess={close} onCancel={close} />,
          },
        },
        {
          id: 'delete',
          icon: Trash2,
          label: 'Delete',
          variant: 'destructive',
          disabled: isDeleting,
          onClick: handleDelete,
        },
      ]}
    />
  );
};
