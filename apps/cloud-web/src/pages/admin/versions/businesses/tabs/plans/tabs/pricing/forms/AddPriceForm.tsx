import { useBillingCycles } from '@hooks/admin/billing-cycles';
import { useCountries } from '@hooks/admin/countries';
import { useCreatePrices } from '@hooks/admin/versions/businesses/plans/prices';
import { Button } from '@vritti/quantum-ui/Button';
import { CurrencyField } from '@vritti/quantum-ui/CurrencyField';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { BillingCycleSelector } from '@vritti/quantum-ui/selects/billing-cycle';
import { CountrySelector } from '@vritti/quantum-ui/selects/country';
import { z, zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { CreatePricesData } from '@/schemas/admin/prices';

const currencyValueSchema = z.object({ currency: z.string(), value: z.string() });

const addPriceFormSchema = z
  .object({
    countryId: z.string().uuid('Please select a country'),
    billingCycleIds: z.array(z.string()).min(1, 'Select at least one billing cycle'),
    amounts: z.record(z.string(), currencyValueSchema.optional()),
  })
  .superRefine((data, ctx) => {
    for (const id of data.billingCycleIds) {
      const raw = (data.amounts[id]?.value ?? '').trim();
      if (!/^\d+(\.\d{1,4})?$/.test(raw)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['amounts', id], message: 'Enter a valid amount' });
      }
    }
  });

type AddPriceFormValues = z.infer<typeof addPriceFormSchema>;

interface AddPriceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  // When set, scopes the form to this country — the selector is hidden and the value is pre-filled
  lockedCountryId?: string;
  // Billing cycles already priced on the card — hidden from the multi-select
  excludeCycleIds?: string[];
}

export const AddPriceForm: React.FC<AddPriceFormProps> = ({
  onSuccess,
  onCancel,
  lockedCountryId,
  excludeCycleIds,
}) => {
  const { versionId, businessId, planId } = useVersionContext();

  const { data: countriesResponse } = useCountries();
  const { data: billingCyclesResponse } = useBillingCycles();

  const form = useForm<AddPriceFormValues>({
    resolver: zodResolver(addPriceFormSchema),
    defaultValues: { countryId: lockedCountryId ?? '', billingCycleIds: [], amounts: {} },
  });

  const createMutation = useCreatePrices({ onSuccess });

  const countryId = form.watch('countryId');
  const selectedCycleIds = form.watch('billingCycleIds');

  const currencyCode = countriesResponse?.result.find((c) => c.id === countryId)?.defaultCurrency ?? '';
  const cycles = billingCyclesResponse?.result ?? [];

  // Builds the API payload — sends each per-cycle composite amount straight through
  const transformSubmit = (
    data: AddPriceFormValues,
  ): { versionId: string; businessId: string; planId: string; data: CreatePricesData } => ({
    versionId,
    businessId,
    planId,
    data: {
      countryId: data.countryId,
      entries: data.billingCycleIds.map((billingCycleId) => ({
        billingCycleId,
        // biome-ignore lint/style/noNonNullAssertion: superRefine guarantees every selected cycle has an amount
        amount: data.amounts[billingCycleId]!,
      })),
    },
  });

  return (
    <Form form={form} mutation={createMutation} resetOnSuccess onCancel={onCancel} transformSubmit={transformSubmit}>
      <FieldGroup>
        {!lockedCountryId && <CountrySelector name="countryId" />}
        <BillingCycleSelector
          name="billingCycleIds"
          label="Billing Cycles"
          placeholder="Select billing cycles"
          multiple
          params={excludeCycleIds?.length ? { excludeIds: excludeCycleIds.join(',') } : undefined}
        />
      </FieldGroup>

      {currencyCode && selectedCycleIds.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-foreground">Amounts</span>
          {selectedCycleIds.map((id) => {
            const cycle = cycles.find((c) => c.id === id);
            return (
              <CurrencyField
                key={id}
                name={`amounts.${id}`}
                label={cycle ? `${cycle.name} (${cycle.days} days)` : 'Amount'}
                currencyCode={currencyCode}
                placeholder="0"
              />
            );
          })}
        </div>
      )}

      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save
        </Button>
      </DialogActions>
    </Form>
  );
};
