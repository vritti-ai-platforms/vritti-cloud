import { useUpdatePriceAmount } from '@hooks/admin/versions/businesses/plans/prices';
import { Button } from '@vritti/quantum-ui/Button';
import { CurrencyField } from '@vritti/quantum-ui/CurrencyField';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { z, zodCurrencyField, zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { PlanPrice } from '@/schemas/admin/prices';

const editAmountFormSchema = z.object({
  amount: zodCurrencyField({ positive: false }),
});

type EditAmountFormValues = z.infer<typeof editAmountFormSchema>;

interface EditPriceAmountFormProps {
  price: PlanPrice;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditPriceAmountForm: React.FC<EditPriceAmountFormProps> = ({ price, onSuccess, onCancel }) => {
  const { versionId, businessId, planId } = useVersionContext();

  const form = useForm<EditAmountFormValues>({
    resolver: zodResolver(editAmountFormSchema),
    defaultValues: { amount: price.amount },
  });

  const updateMutation = useUpdatePriceAmount({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({
        versionId,
        businessId,
        planId,
        priceId: price.id,
        data: { amount: data.amount },
      })}
    >
      <FieldGroup>
        <CurrencyField name="amount" label="Amount" currencyCode={price.currencyCode} placeholder="0" />
      </FieldGroup>
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
