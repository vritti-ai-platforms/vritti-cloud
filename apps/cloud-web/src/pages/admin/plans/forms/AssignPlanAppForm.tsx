import { zodResolver } from '@hookform/resolvers/zod';
import { useAssignPlanApp } from '@hooks/admin/plan-apps';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { AppCodeSelector } from '@vritti/quantum-ui/selects/app-code';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type AssignPlanAppData, assignPlanAppSchema } from '@/schemas/admin/plan-apps';

interface AssignPlanAppFormProps {
  planId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AssignPlanAppForm: React.FC<AssignPlanAppFormProps> = ({ planId, onSuccess, onCancel }) => {
  const form = useForm<AssignPlanAppData>({
    resolver: zodResolver(assignPlanAppSchema),
    defaultValues: { appCode: '' },
  });

  const assignMutation = useAssignPlanApp({
    onSuccess: () => {
      form.reset();
      onSuccess();
    },
  });

  return (
    <Form
      form={form}
      mutation={assignMutation}
     
      transformSubmit={(data) => ({ planId, data })}
    >
      <AppCodeSelector name="appCode" />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => { form.reset(); onCancel(); }}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Assigning...">
          Assign App
        </Button>
      </div>
    </Form>
  );
};
