import { useMarkets } from '@hooks/admin/markets';
import { useDeletePlanPrice, usePlanPrices, useUpsertPlanPrice } from '@hooks/admin/plan-prices';
import { cn } from '@vritti/quantum-ui';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { useSlugParams } from '@vritti/quantum-ui/hooks';
import { majorToMinor, minorToMajor } from '@vritti/quantum-ui/money';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { DollarSign } from 'lucide-react';
import { useCallback } from 'react';
import {
  BILLING_PERIOD_LABELS,
  BILLING_PERIODS,
  type BillingPeriod,
  type PlanPrice,
} from '@/schemas/admin/plan-prices';

// Builds a lookup keyed by `${marketId}:${billingPeriod}` for fast cell access
function indexPrices(prices: PlanPrice[]): Map<string, PlanPrice> {
  const map = new Map<string, PlanPrice>();
  for (const price of prices) {
    map.set(`${price.marketId}:${price.billingPeriod}`, price);
  }
  return map;
}

// Prices grid — markets (rows) × billing periods (columns), amounts in market currency
export const PricesTab = () => {
  const { id: planId } = useSlugParams('planSlug');
  const planIdValue = planId ?? '';

  const { data: marketsResponse, isLoading: marketsLoading } = useMarkets();
  const { data: prices = [], isLoading: pricesLoading } = usePlanPrices(planIdValue);

  const upsertMutation = useUpsertPlanPrice();
  const deleteMutation = useDeletePlanPrice();

  const priceIndex = indexPrices(prices);

  // Persists a single cell — upsert when an amount is entered, delete when cleared
  const handleSave = useCallback(
    (marketId: string, currencyCode: string, billingPeriod: BillingPeriod, rawValue: string) => {
      const existing = priceIndex.get(`${marketId}:${billingPeriod}`);
      const trimmed = rawValue.trim();

      if (!trimmed) {
        if (existing) deleteMutation.mutate({ planId: planIdValue, priceId: existing.id });
        return;
      }
      if (!/^\d+(\.\d{1,4})?$/.test(trimmed)) return;

      let amount: number;
      try {
        amount = Number(majorToMinor(trimmed, currencyCode));
      } catch {
        return;
      }
      if (existing && existing.amount === amount) return;

      upsertMutation.mutate({ planId: planIdValue, data: { marketId, billingPeriod, amount } });
    },
    [priceIndex, planIdValue, deleteMutation, upsertMutation],
  );

  if (marketsLoading || pricesLoading) {
    return (
      <div className="pt-4 flex flex-col gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const markets = marketsResponse?.result ?? [];

  if (markets.length === 0) {
    return (
      <div className="pt-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <DollarSign className="size-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">No markets configured</p>
            <p className="text-xs text-muted-foreground mt-1">Add markets before setting plan prices.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pt-4 flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Set prices per market and billing period. Amounts are shown in each market's currency. Clear a cell to remove
        its price.
      </p>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Market</th>
              {BILLING_PERIODS.map((period) => (
                <th key={period} className="px-4 py-3 text-left font-medium">
                  {BILLING_PERIOD_LABELS[period]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {markets.map((market) => (
              <tr key={market.id} className="bg-card">
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-col">
                    <span className="font-medium">{market.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{market.currencyCode}</span>
                  </div>
                </td>
                {BILLING_PERIODS.map((period) => (
                  <PriceCell
                    key={period}
                    marketId={market.id}
                    currencyCode={market.currencyCode}
                    billingPeriod={period}
                    price={priceIndex.get(`${market.id}:${period}`)}
                    onSave={handleSave}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface PriceCellProps {
  marketId: string;
  currencyCode: string;
  billingPeriod: BillingPeriod;
  price: PlanPrice | undefined;
  onSave: (marketId: string, currencyCode: string, billingPeriod: BillingPeriod, rawValue: string) => void;
}

// Converts a stored minor-unit amount to its major-unit string for editing
function toMajorInput(price: PlanPrice | undefined, currencyCode: string): string {
  if (!price) return '';
  try {
    return minorToMajor(String(price.amount), currencyCode);
  } catch {
    return '';
  }
}

const PriceCell = ({ marketId, currencyCode, billingPeriod, price, onSave }: PriceCellProps) => (
  <td className="px-4 py-2 align-top">
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground font-mono shrink-0">{currencyCode}</span>
      <input
        type="text"
        inputMode="decimal"
        defaultValue={toMajorInput(price, currencyCode)}
        placeholder="—"
        onBlur={(e) => onSave(marketId, currencyCode, billingPeriod, e.target.value)}
        className={cn(
          'w-28 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      />
    </div>
  </td>
);
