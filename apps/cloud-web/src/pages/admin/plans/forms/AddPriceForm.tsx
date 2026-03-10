import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePrice } from '@hooks/admin/prices';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import { CloudProviderSelector } from '@vritti/quantum-ui/selects/cloud-provider';
import { IndustrySelector } from '@vritti/quantum-ui/selects/industry';
import { RegionSelector } from '@vritti/quantum-ui/selects/region';
import { CurrencySelector } from '@vritti/quantum-ui/selects/currency';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type CreatePriceData, createPriceSchema } from '@/schemas/admin/prices';

interface AddPriceFormProps {
  planId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddPriceForm: React.FC<AddPriceFormProps> = ({ planId, onSuccess, onCancel }) => {
  const form = useForm<CreatePriceData>({
    resolver: zodResolver(createPriceSchema),
    defaultValues: { planId, currency: 'INR' },
  });

  const regionId = form.watch('regionId');

  const createMutation = useCreatePrice({
    onSuccess: () => {
      form.reset({ planId, currency: 'INR' });
      onSuccess();
    },
  });

  const handleCancel = () => {
    form.reset({ planId, currency: 'INR' });
    onCancel();
  };

  return (
    <Form form={form} mutation={createMutation} showRootError>
      <IndustrySelector name="industryId" label="Industry" placeholder="Select industry" />
      <RegionSelector
        name="regionId"
        label="Region"
        placeholder="Select region"
        onChange={() => form.setValue('providerId', '')}
      />
      <CloudProviderSelector
        name="providerId"
        label="Cloud Provider"
        placeholder="Select provider"
        disabled={!regionId}
        params={regionId ? { regionId: String(regionId) } : undefined}
      />
      <TextField name="price" label="Price" placeholder="e.g. 2999.00" />
      <CurrencySelector name="currency" />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Price
        </Button>
      </div>
    </Form>
  );
};
