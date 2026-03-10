import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePlan } from '@hooks/admin/plans';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type CreatePlanData, createPlanSchema } from '@/schemas/admin/plans';

interface AddPlanFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddPlanForm: React.FC<AddPlanFormProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<CreatePlanData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: { name: '', code: '' },
  });

  const createMutation = useCreatePlan({
    onSuccess: () => {
      form.reset();
      onSuccess();
    },
  });

  // Cancel resets the form then notifies the parent
  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <Form form={form} mutation={createMutation} showRootError>
      <TextField name="name" label="Plan Name" placeholder="e.g. Pro" />
      <TextField name="code" label="Code" placeholder="e.g. pro" description="Unique code identifier for this plan" />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Plan
        </Button>
      </div>
    </Form>
  );
};
