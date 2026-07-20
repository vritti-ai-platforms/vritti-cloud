import { useUpdateLegalEntity } from '@hooks/cloud/org-structure';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog, DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form, FormSection } from '@vritti/quantum-ui/Form';
import type { DialogHandle } from '@vritti/quantum-ui/hooks';
import { Select } from '@vritti/quantum-ui/Select';
import { CurrencySelector } from '@vritti/quantum-ui/selects/currency';
import { ISOCountrySelect } from '@vritti/quantum-ui/selects/iso-country';
import { LegalEntitySelector } from '@vritti/quantum-ui/selects/legal-entity';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { Landmark } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  type CreateLegalEntityData,
  createLegalEntitySchema,
  type LegalEntity,
  MONTH_OPTIONS,
  TAX_REGIME_OPTIONS,
} from '@/schemas/cloud/org-structure';

interface EditLegalEntityFormProps {
  orgId: string;
  legalEntity: LegalEntity;
  onClose: () => void;
}

const EditLegalEntityForm = ({ orgId, legalEntity, onClose }: EditLegalEntityFormProps) => {
  const form = useForm<CreateLegalEntityData>({
    resolver: zodResolver(createLegalEntitySchema),
    defaultValues: {
      name: legalEntity.name,
      code: legalEntity.code,
      country: legalEntity.country,
      currencyCode: legalEntity.currencyCode,
      taxRegime: legalEntity.taxRegime,
      taxId: legalEntity.taxId ?? '',
      fiscalYearStart: legalEntity.fiscalYearStart,
      parentId: legalEntity.parentId ?? null,
    },
  });

  const updateMutation = useUpdateLegalEntity({ onSuccess: onClose });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      transformSubmit={(data) => ({ orgId, leId: legalEntity.id, data })}
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
            params={{ orgId, excludeId: legalEntity.id }}
            clearable
          />
        </FormSection>
      </div>

      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </DialogActions>
    </Form>
  );
};

interface EditLegalEntityDialogProps {
  handle: DialogHandle;
  orgId: string;
  legalEntity: LegalEntity | null;
}

export const EditLegalEntityDialog = ({ handle, orgId, legalEntity }: EditLegalEntityDialogProps) => (
  <Dialog
    handle={handle}
    icon={Landmark}
    title={legalEntity ? `Edit ${legalEntity.name}` : 'Edit Legal Entity'}
    description="Update the legal entity's money and tax configuration."
    className="max-w-3xl"
    content={(close) =>
      legalEntity ? <EditLegalEntityForm orgId={orgId} legalEntity={legalEntity} onClose={close} /> : null
    }
  />
);
