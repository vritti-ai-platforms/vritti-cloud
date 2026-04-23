import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdatePrice } from '@hooks/admin/prices';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import { CurrencySelector } from '@vritti/quantum-ui/selects/currency';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { Price } from '@/schemas/admin/prices';
import { type UpdatePriceData, updatePriceSchema } from '@/schemas/admin/prices';

interface EditPriceFormProps {
  price: Price;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditPriceForm: React.FC<EditPriceFormProps> = ({ price, onSuccess, onCancel }) => {
  const form = useForm<UpdatePriceData>({
    resolver: zodResolver(updatePriceSchema),
    defaultValues: { price: price.price, currency: price.currency },
  });

  const updateMutation = useUpdatePrice({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
     
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({ id: price.id, planId: price.planId, data })}
    >
      <TextField name="price" label="Price" placeholder="e.g. 2999.00" />
      <CurrencySelector name="currency" />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </div>
    </Form>
  );
};
