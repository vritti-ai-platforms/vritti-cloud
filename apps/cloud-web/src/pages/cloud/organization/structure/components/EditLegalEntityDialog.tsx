import { useUpdateLegalEntity } from '@hooks/cloud/org-structure';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog, DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import type { DialogHandle } from '@vritti/quantum-ui/hooks';
import { Select } from '@vritti/quantum-ui/Select';
import { CountrySelector } from '@vritti/quantum-ui/selects/country';
import { CurrencySelector } from '@vritti/quantum-ui/selects/currency';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { Landmark } from 'lucide-react';
import { useMemo } from 'react';
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
  legalEntities: LegalEntity[];
  onClose: () => void;
}

const EditLegalEntityForm = ({ orgId, legalEntity, legalEntities, onClose }: EditLegalEntityFormProps) => {
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
      parentId: legalEntity.parentId ?? '',
    },
  });

  const updateMutation = useUpdateLegalEntity({ onSuccess: onClose });

  const descendantIds = useMemo(() => {
    const ids = new Set<string>();
    const collect = (parentId: string) => {
      for (const le of legalEntities) {
        if (le.parentId === parentId && !ids.has(le.id)) {
          ids.add(le.id);
          collect(le.id);
        }
      }
    };
    collect(legalEntity.id);
    return ids;
  }, [legalEntities, legalEntity.id]);

  const parentOptions = [
    { value: '', label: 'None (independent)' },
    ...legalEntities
      .filter((le) => le.id !== legalEntity.id && !descendantIds.has(le.id))
      .map((le) => ({ value: le.id, label: le.name, description: le.code })),
  ];

  return (
    <Form
      form={form}
      mutation={updateMutation}
      transformSubmit={(data) => ({
        orgId,
        leId: legalEntity.id,
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
  legalEntities: LegalEntity[];
}

export const EditLegalEntityDialog = ({ handle, orgId, legalEntity, legalEntities }: EditLegalEntityDialogProps) => (
  <Dialog
    handle={handle}
    icon={Landmark}
    title={legalEntity ? `Edit ${legalEntity.name}` : 'Edit Legal Entity'}
    description="Update the legal entity's money and tax configuration."
    className="sm:max-w-2xl"
    content={(close) =>
      legalEntity ? (
        <EditLegalEntityForm orgId={orgId} legalEntity={legalEntity} legalEntities={legalEntities} onClose={close} />
      ) : null
    }
  />
);
