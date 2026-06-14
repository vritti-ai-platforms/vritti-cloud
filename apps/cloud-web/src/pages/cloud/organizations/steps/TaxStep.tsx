import { CountrySelector } from '@components/selectors';
import { useValidateTaxId } from '@hooks/cloud/organizations';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import type { CreateOrgFormData } from '@/schemas/cloud/organizations';

interface TaxStepProps {
  form: UseFormReturn<CreateOrgFormData>;
  onBack: () => void;
  onContinue: () => void;
}

export const TaxStep: React.FC<TaxStepProps> = ({ form, onBack, onContinue }) => {
  const taxId = useWatch({ control: form.control, name: 'taxId' });
  const countryName = useWatch({ control: form.control, name: 'countryName' });
  const marketName = useWatch({ control: form.control, name: 'marketName' });
  const validatedCountryId = useWatch({ control: form.control, name: 'countryId' });

  const validateMutation = useValidateTaxId({
    onSuccess: (result) => {
      form.setValue('countryId', result.countryId);
      form.setValue('countryCode', result.countryCode);
      form.setValue('countryName', result.countryName ?? result.countryCode);
      form.setValue('marketId', result.marketId);
      form.setValue('marketName', result.marketName ?? '');
      onContinue();
    },
  });

  const isValidated = !!validatedCountryId;

  return (
    <Form
      form={form}
      mutation={validateMutation}
      resetOnSuccess={false}
      transformSubmit={(data) => ({ taxId: data.taxId, countryId: data.countryId || undefined })}
    >
      <div className="flex flex-col gap-6">
        <TextField
          name="taxId"
          label="Tax ID"
          placeholder="e.g. GSTIN or TRN"
          description="We use your tax ID to determine your country and pricing market"
          onChange={() => {
            // Reset any previously derived values when the tax id changes
            form.setValue('countryId', '');
            form.setValue('countryName', '');
            form.setValue('marketName', '');
          }}
        />

        <CountrySelector
          name="countryId"
          label="Country (optional)"
          placeholder="Select to disambiguate if needed"
          params={{ isActive: true }}
          onOptionSelect={(opt) => form.setValue('countryName', opt?.label ?? '')}
        />

        {isValidated && (
          <div className="flex items-start gap-3 rounded-lg bg-success/15 text-success p-4">
            <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Tax ID validated</span>
              <span className="text-foreground">
                Country: <span className="font-medium">{countryName}</span>
              </span>
              {marketName && (
                <span className="text-foreground">
                  Market: <span className="font-medium">{marketName}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {validateMutation.isError && !isValidated && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/15 text-destructive p-4 text-sm">
            <AlertCircle className="size-5 shrink-0" />
            <span>We couldn't validate this tax ID. Check the value and country, then try again.</span>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" disabled={!taxId} isLoading={validateMutation.isPending} loadingText="Validating...">
          {isValidated ? 'Continue' : 'Validate & Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Form>
  );
};
