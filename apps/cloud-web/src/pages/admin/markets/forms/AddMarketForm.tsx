import { useCreateMarket } from '@hooks/admin/markets';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Switch } from '@vritti/quantum-ui/Switch';
import { CurrencySelector } from '@vritti/quantum-ui/selects/currency';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type CreateMarketData, createMarketSchema } from '@/schemas/admin/markets';

interface AddMarketFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddMarketForm: React.FC<AddMarketFormProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<CreateMarketData>({
    resolver: zodResolver(createMarketSchema),
    defaultValues: { code: '', name: '', currencyCode: '', isActive: true },
  });

  const createMutation = useCreateMarket({ onSuccess });

  return (
    <Form form={form} mutation={createMutation} resetOnSuccess onCancel={onCancel}>
      <TextField name="name" label="Market Name" placeholder="e.g. India" />
      <TextField name="code" label="Code" placeholder="e.g. in" />
      <CurrencySelector name="currencyCode" label="Currency" />
      <Switch name="isActive" label="Active" description="Inactive markets are hidden from pricing and onboarding" />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Market
        </Button>
      </DialogActions>
    </Form>
  );
};
