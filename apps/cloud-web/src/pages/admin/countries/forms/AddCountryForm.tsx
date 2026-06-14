import { useCreateCountry } from '@hooks/admin/countries';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { Switch } from '@vritti/quantum-ui/Switch';
import { CurrencySelector } from '@vritti/quantum-ui/selects/currency';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type CreateCountryData, createCountrySchema, TAX_REGIMES } from '@/schemas/admin/countries';

const TAX_REGIME_OPTIONS = TAX_REGIMES.map((value) => ({ value, label: value }));

interface AddCountryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddCountryForm: React.FC<AddCountryFormProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<CreateCountryData>({
    resolver: zodResolver(createCountrySchema),
    defaultValues: { code: '', name: '', defaultCurrency: '', taxRegime: 'NONE', isActive: true },
  });

  const createMutation = useCreateCountry({ onSuccess });

  return (
    <Form form={form} mutation={createMutation} resetOnSuccess onCancel={onCancel}>
      <FieldGroup>
        <TextField name="name" label="Country Name" placeholder="e.g. India" />
        <TextField name="code" label="ISO Code" placeholder="e.g. IN" description="Two-letter uppercase ISO code" />
        <CurrencySelector name="defaultCurrency" label="Default Currency" />
        <Select name="taxRegime" label="Tax Regime" placeholder="Select tax regime" options={TAX_REGIME_OPTIONS} />
        <TextField name="taxIdLabel" label="Tax ID Label" placeholder="e.g. GSTIN, TRN" />
        <TextField name="taxIdPattern" label="Tax ID Pattern" placeholder="Regex pattern (optional)" />
        <TextField name="callingCode" label="Calling Code" placeholder="e.g. +91" />
      </FieldGroup>
      <Switch name="isActive" label="Active" description="Inactive countries are hidden from onboarding" />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Country
        </Button>
      </DialogActions>
    </Form>
  );
};
