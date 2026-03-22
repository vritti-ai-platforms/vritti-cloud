import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateAppPrice } from '@hooks/admin/apps';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import { CloudProviderSelector } from '@vritti/quantum-ui/selects/cloud-provider';
import { CurrencySelector } from '@vritti/quantum-ui/selects/currency';
import { RegionSelector } from '@vritti/quantum-ui/selects/region';
import type React from 'react';
import { type Resolver, useForm } from 'react-hook-form';
import { useVersionContext } from '@/hooks/admin/app-versions/useVersionContext';
import { type AddAppPriceData, addAppPriceSchema } from '@/schemas/admin/apps';

interface AddAppPriceFormProps {
  appId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddAppPriceForm: React.FC<AddAppPriceFormProps> = ({ appId, onSuccess, onCancel }) => {
  const { versionId } = useVersionContext();

  const form = useForm<AddAppPriceData>({
    resolver: zodResolver(addAppPriceSchema) as Resolver<AddAppPriceData>,
    defaultValues: { currency: 'INR' },
  });

  const regionId = form.watch('regionId');

  const createMutation = useCreateAppPrice({
    onSuccess: () => {
      form.reset({ currency: 'INR' });
      onSuccess();
    },
  });

  return (
    <Form
      form={form}
      mutation={createMutation}
      showRootError
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data: AddAppPriceData) => ({ versionId, appId, data })}
    >
      <RegionSelector
        name="regionId"
        label="Region"
        placeholder="Select region"
        onOptionSelect={() => form.setValue('cloudProviderId', '')}
      />
      <CloudProviderSelector
        name="cloudProviderId"
        label="Cloud Provider"
        placeholder="Select provider"
        disabled={!regionId}
        params={regionId ? { regionId: String(regionId) } : undefined}
      />
      <TextField name="monthlyPrice" label="Monthly Price" placeholder="e.g. 999.00" />
      <CurrencySelector name="currency" />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Price
        </Button>
      </div>
    </Form>
  );
};
