import { useCountries } from '@hooks/admin/countries';
import { useDeletePlanPrice, usePlanPrices, useUpsertPlanPrice } from '@hooks/admin/versions/businesses/plans/prices';
import { cn } from '@vritti/quantum-ui';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { majorToMinor, minorToMajor } from '@vritti/quantum-ui/money';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { DollarSign } from 'lucide-react';
import { useCallback } from 'react';
import { useVersionContext } from '@/context/VersionScopeContext';
import {
  BILLING_PERIOD_LABELS,
  BILLING_PERIODS,
  type BillingPeriod,
  type PlanPrice,
} from '@/schemas/admin/plan-prices';

// Builds a lookup keyed by `${countryId}:${billingPeriod}` for fast cell access
function indexPrices(prices: PlanPrice[]): Map<string, PlanPrice> {
  const map = new Map<string, PlanPrice>();
  for (const price of prices) {
    map.set(`${price.countryId}:${price.billingPeriod}`, price);
  }
  return map;
}

// Prices grid — countries (rows) × billing periods (columns), amounts in each country's default currency
export const PricesTab = () => {
  const { versionId: versionIdValue, businessId: businessIdValue, planId: planIdValue } = useVersionContext();

  const { data: countriesResponse, isLoading: countriesLoading } = useCountries();
  const { data: prices = [], isLoading: pricesLoading } = usePlanPrices(versionIdValue, businessIdValue, planIdValue);

  const upsertMutation = useUpsertPlanPrice();
  const deleteMutation = useDeletePlanPrice();

  const priceIndex = indexPrices(prices);

  // Persists a single cell — upsert when an amount is entered, delete when cleared
  const handleSave = useCallback(
    (countryId: string, currencyCode: string, billingPeriod: BillingPeriod, rawValue: string) => {
      const existing = priceIndex.get(`${countryId}:${billingPeriod}`);
      const trimmed = rawValue.trim();
      const scope = { versionId: versionIdValue, businessId: businessIdValue, planId: planIdValue };

      if (!trimmed) {
        if (existing) deleteMutation.mutate({ ...scope, priceId: existing.id });
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

      upsertMutation.mutate({ ...scope, data: { countryId, billingPeriod, amount } });
    },
    [priceIndex, versionIdValue, businessIdValue, planIdValue, deleteMutation, upsertMutation],
  );

  if (countriesLoading || pricesLoading) {
    return (
      <div className="pt-4 flex flex-col gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const countries = (countriesResponse?.result ?? []).filter((c) => c.isActive);

  if (countries.length === 0) {
    return (
      <div className="pt-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <DollarSign className="size-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">No countries configured</p>
            <p className="text-xs text-muted-foreground mt-1">Add countries before setting plan prices.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pt-4 flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Set prices per country and billing period. Amounts are shown in each country's default currency. Clear a cell to
        remove its price.
      </p>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Country</th>
              {BILLING_PERIODS.map((period) => (
                <th key={period} className="px-4 py-3 text-left font-medium">
                  {BILLING_PERIOD_LABELS[period]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {countries.map((country) => (
              <tr key={country.id} className="bg-card">
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-col">
                    <span className="font-medium">{country.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{country.defaultCurrency}</span>
                  </div>
                </td>
                {BILLING_PERIODS.map((period) => (
                  <PriceCell
                    key={period}
                    countryId={country.id}
                    currencyCode={country.defaultCurrency}
                    billingPeriod={period}
                    price={priceIndex.get(`${country.id}:${period}`)}
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
  countryId: string;
  currencyCode: string;
  billingPeriod: BillingPeriod;
  price: PlanPrice | undefined;
  onSave: (countryId: string, currencyCode: string, billingPeriod: BillingPeriod, rawValue: string) => void;
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

const PriceCell = ({ countryId, currencyCode, billingPeriod, price, onSave }: PriceCellProps) => (
  <td className="px-4 py-2 align-top">
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground font-mono shrink-0">{currencyCode}</span>
      <input
        type="text"
        inputMode="decimal"
        defaultValue={toMajorInput(price, currencyCode)}
        placeholder="—"
        onBlur={(e) => onSave(countryId, currencyCode, billingPeriod, e.target.value)}
        className={cn(
          'w-28 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      />
    </div>
  </td>
);
