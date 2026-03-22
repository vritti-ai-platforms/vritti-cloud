import { useOrgBusinessUnits } from '@hooks/cloud/org-business-units';
import { Button } from '@vritti/quantum-ui/Button';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { Check } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { OrgApp } from '@/schemas/cloud/org-apps';

interface AddonPurchaseDialogProps {
  app: OrgApp;
  orgId: string;
  onConfirm: (businessUnitIds: string[]) => void;
  onCancel: () => void;
  isPending: boolean;
}

// Dialog content for purchasing an addon app for selected business units
export const AddonPurchaseDialog: React.FC<AddonPurchaseDialogProps> = ({
  app,
  orgId,
  onConfirm,
  onCancel,
  isPending,
}) => {
  const { data: buResponse, isLoading: busLoading } = useOrgBusinessUnits(orgId);
  const businessUnits = buResponse?.result ?? [];

  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Toggle a BU selection
  const toggleBu = (buId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(buId)) next.delete(buId);
      else next.add(buId);
      return next;
    });
  };

  const newSelections = [...selected];
  const pricePerUnit = app.price ? Number.parseFloat(app.price.monthlyPrice) : 0;
  const totalCost = pricePerUnit * newSelections.length;
  const currency = app.price?.currency ?? 'INR';

  const handleConfirm = () => {
    if (newSelections.length > 0) {
      onConfirm(newSelections);
    }
  };

  if (busLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-5 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Pricing summary */}
      <div className="rounded-lg bg-muted/30 p-4">
        <p className="text-sm font-medium">{app.name}</p>
        {app.price && (
          <p className="text-xs text-muted-foreground mt-1">
            {currency} {app.price.monthlyPrice} per business unit / month
          </p>
        )}
      </div>

      {/* Business unit selection */}
      <div>
        <p className="text-sm font-medium mb-2">Select business units</p>
        {businessUnits.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No business units found. Create business units first.
          </p>
        ) : (
          <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
            {businessUnits.map((bu) => {
              const isChecked = selected.has(bu.id);
              return (
                <button
                  type="button"
                  key={bu.id}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => toggleBu(bu.id)}
                >
                  <div
                    className={`flex items-center justify-center size-4 rounded border shrink-0 transition-colors ${
                      isChecked
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-border'
                    }`}
                  >
                    {isChecked && <Check className="size-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm">{bu.name}</span>
                    <span className="text-xs text-muted-foreground ml-2 font-mono">{bu.code}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Total cost */}
      {newSelections.length > 0 && app.price && (
        <div className="rounded-lg bg-muted/30 p-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {newSelections.length} unit{newSelections.length !== 1 ? 's' : ''}
          </span>
          <span className="text-sm font-semibold">
            {currency} {totalCost.toFixed(2)} / month
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={newSelections.length === 0}
          isLoading={isPending}
          loadingText="Purchasing..."
        >
          Confirm Purchase
        </Button>
      </div>
    </div>
  );
};
