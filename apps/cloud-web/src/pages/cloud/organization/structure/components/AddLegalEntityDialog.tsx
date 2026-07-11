import { useCreateLegalEntity } from '@hooks/cloud/org-structure';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog, DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { Select } from '@vritti/quantum-ui/Select';
import { CountrySelector } from '@vritti/quantum-ui/selects/country';
import { CurrencySelector } from '@vritti/quantum-ui/selects/currency';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { Landmark, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  type CreateLegalEntityData,
  createLegalEntitySchema,
  type LegalEntity,
  MONTH_OPTIONS,
  TAX_REGIME_OPTIONS,
} from '@/schemas/cloud/org-structure';

interface LegalEntityFormProps {
  orgId: string;
  legalEntities: LegalEntity[];
  onClose: () => void;
}

const LegalEntityForm = ({ orgId, legalEntities, onClose }: LegalEntityFormProps) => {
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
      parentId: '',
    },
  });

  const createMutation = useCreateLegalEntity({ onSuccess: onClose });

  const parentOptions = [
    { value: '', label: 'None (independent)' },
    ...legalEntities.map((le) => ({ value: le.id, label: le.name, description: le.code })),
  ];

  return (
    <Form
      form={form}
      mutation={createMutation}
      transformSubmit={(data) => ({
        orgId,
        data: { ...data, taxId: data.taxId || undefined, parentId: data.parentId || undefined },
      })}
      onCancel={onClose}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField name="name" label="Name" placeholder="e.g. CJ South Beverages Pvt Ltd" />
        <TextField name="code" label="Code" placeholder="e.g. cj-south" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CountrySelector name="country" fieldKeys={{ valueKey: 'code', labelKey: 'name' }} />
        <CurrencySelector name="currencyCode" label="Base Currency" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select name="taxRegime" label="Tax Regime" placeholder="Select tax regime" options={TAX_REGIME_OPTIONS} />
        <TextField name="taxId" label="Tax ID" placeholder="e.g. PAN or CR number" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select name="fiscalYearStart" label="Fiscal Year Start" options={MONTH_OPTIONS} />
        <Select
          name="parentId"
          label="Parent Legal Entity"
          placeholder="Select parent"
          options={parentOptions}
          description="Optional — makes it a subsidiary"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Tax registrations (GSTIN/VAT per state) are added from the legal entity panel after creation.
      </p>

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
  legalEntities: LegalEntity[];
}

export const AddLegalEntityDialog = ({ orgId, legalEntities }: AddLegalEntityDialogProps) => {
  const dialog = useDialog();

  return (
    <>
      <Button variant="outline" size="sm" startAdornment={<Plus className="size-4" />} onClick={dialog.open}>
        Add Legal Entity
      </Button>
      <Dialog
        handle={dialog}
        icon={Landmark}
        title="Add Legal Entity"
        description="A legal entity owns the money — registrations, currency, and tax filings live here."
        className="sm:max-w-2xl"
        content={(close) => <LegalEntityForm orgId={orgId} legalEntities={legalEntities} onClose={close} />}
      />
    </>
  );
};
