import { zodResolver } from '@hookform/resolvers/zod';
import { useAssignIndustryApp } from '@hooks/admin/industry-apps';
import { AppSelector } from '@vritti/quantum-ui/selects/app';
import { Button } from '@vritti/quantum-ui/Button';
import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { Form } from '@vritti/quantum-ui/Form';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type AssignIndustryAppData, assignIndustryAppSchema } from '@/schemas/admin/industry-apps';

interface AssignIndustryAppFormProps {
  industryId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AssignIndustryAppForm: React.FC<AssignIndustryAppFormProps> = ({ industryId, onSuccess, onCancel }) => {
  const form = useForm<AssignIndustryAppData>({
    resolver: zodResolver(assignIndustryAppSchema),
    defaultValues: { isRecommended: false },
  });

  const assignMutation = useAssignIndustryApp({
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
    <Form
      form={form}
      mutation={assignMutation}
      showRootError
      transformSubmit={(data) => ({ industryId, data })}
    >
      <AppSelector name="appId" />
      <Checkbox name="isRecommended" label="Recommended for this industry" />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Assigning...">
          Assign App
        </Button>
      </div>
    </Form>
  );
};
