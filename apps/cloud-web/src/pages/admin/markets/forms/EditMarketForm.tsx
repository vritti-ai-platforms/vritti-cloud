import { useUpdateMarket } from '@hooks/admin/markets';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Switch } from '@vritti/quantum-ui/Switch';
import { CurrencySelector } from '@vritti/quantum-ui/selects/currency';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { Market } from '@/schemas/admin/markets';
import { type UpdateMarketData, updateMarketSchema } from '@/schemas/admin/markets';

interface EditMarketFormProps {
  market: Market;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditMarketForm: React.FC<EditMarketFormProps> = ({ market, onSuccess, onCancel }) => {
  const form = useForm<UpdateMarketData>({
    resolver: zodResolver(updateMarketSchema),
    defaultValues: {
      name: market.name,
      code: market.code,
      currencyCode: market.currencyCode,
      isActive: market.isActive,
    },
  });

  const updateMutation = useUpdateMarket({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({ id: market.id, data })}
    >
      <TextField name="name" label="Market Name" placeholder="e.g. India" />
      <TextField name="code" label="Code" placeholder="e.g. in" description="Unique lowercase identifier" />
      <CurrencySelector name="currencyCode" label="Currency" />
      <Switch name="isActive" label="Active" description="Inactive markets are hidden from pricing and onboarding" />
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
