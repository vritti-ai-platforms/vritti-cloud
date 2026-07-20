import { useCreateLegalEntity } from '@hooks/cloud/org-structure';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog, DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form, FormSection } from '@vritti/quantum-ui/Form';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { Select } from '@vritti/quantum-ui/Select';
import { CurrencySelector } from '@vritti/quantum-ui/selects/currency';
import { ISOCountrySelect } from '@vritti/quantum-ui/selects/iso-country';
import { LegalEntitySelector } from '@vritti/quantum-ui/selects/legal-entity';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { Landmark, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  type CreateLegalEntityData,
  createLegalEntitySchema,
  MONTH_OPTIONS,
  TAX_REGIME_OPTIONS,
} from '@/schemas/cloud/org-structure';

interface LegalEntityFormProps {
  orgId: string;
  onClose: () => void;
}

const LegalEntityForm = ({ orgId, onClose }: LegalEntityFormProps) => {
  const form = useForm<CreateLegalEntityData>({
    resolver: zodResolver(createLegalEntitySchema),
    defaultValues: {
      name: '',
      code: '',
      country: '',
      currencyCode: '',
      taxRegime: 'GST',
      taxId: '',
      fiscalYearStart: 4,
      parentId: null,
    },
  });

  const createMutation = useCreateLegalEntity({ onSuccess: onClose });

  return (
    <Form
      form={form}
      mutation={createMutation}
      transformSubmit={(data) => ({ orgId, data })}
      onCancel={onClose}
    >
      <div className="space-y-6">
        <FormSection title="Identity">
          <TextField name="name" label="Name" placeholder="e.g. CJ South Beverages Pvt Ltd" />
          <TextField name="code" label="Code" placeholder="e.g. cj-south" />
        </FormSection>

        <FormSection title="Money & Tax">
          <ISOCountrySelect name="country" />
          <CurrencySelector name="currencyCode" label="Base Currency" />
          <Select name="taxRegime" label="Tax Regime" placeholder="Select tax regime" options={TAX_REGIME_OPTIONS} />
          <TextField name="taxId" label="Tax ID" placeholder="e.g. PAN or CR number" />
        </FormSection>

        <FormSection title="Hierarchy">
          <Select name="fiscalYearStart" label="Fiscal Year Start" options={MONTH_OPTIONS} />
          <LegalEntitySelector
            name="parentId"
            label="Parent Legal Entity"
            description="Leave empty for a top-level entity."
            params={{ orgId }}
            clearable
          />
          <p className="col-span-2 text-xs text-muted-foreground">
            Tax registrations (GSTIN/VAT per state) are added from the legal entity panel after creation.
          </p>
        </FormSection>
      </div>

      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Creating...">
          Create Legal Entity
        </Button>
      </DialogActions>
    </Form>
  );
};

interface AddLegalEntityDialogProps {
  orgId: string;
  variant?: 'default' | 'outline';
}

export const AddLegalEntityDialog = ({ orgId, variant = 'outline' }: AddLegalEntityDialogProps) => {
  const dialog = useDialog();

  return (
    <>
      <Button variant={variant} size="sm" startAdornment={<Plus className="size-4" />} onClick={dialog.open}>
        Add Legal Entity
      </Button>
      <Dialog
        handle={dialog}
        icon={Landmark}
        title="Add Legal Entity"
        description="A legal entity owns the money — registrations, currency, and tax filings live here."
        className="max-w-3xl"
        content={(close) => <LegalEntityForm orgId={orgId} onClose={close} />}
      />
    </>
  );
};
