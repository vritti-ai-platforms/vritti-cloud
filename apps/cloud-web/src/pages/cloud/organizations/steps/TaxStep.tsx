import { CountrySelector } from '@components/selectors';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
  const countryId = useWatch({ control: form.control, name: 'countryId' });

  return (
    <Form form={form} onSubmit={onContinue} resetOnSuccess={false}>
      <div className="flex flex-col gap-6">
        <CountrySelector
          name="countryId"
          label="Country"
          placeholder="Select your country"
          params={{ isActive: true }}
          onOptionSelect={(opt) => {
            form.setValue('countryName', opt?.label ?? '');
            form.setValue('countryCode', opt?.description ?? '');
          }}
        />

        <TextField
          name="taxId"
          label="Tax ID (optional)"
          placeholder="e.g. GSTIN or TRN"
          description="Add your tax identifier now or later from organization settings"
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" disabled={!countryId}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Form>
  );
};
