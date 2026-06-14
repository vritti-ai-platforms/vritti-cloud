import { useAssignVersionBusiness } from '@hooks/admin/version-businesses';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { BusinessSelector } from '@vritti/quantum-ui/selects/business';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type AssignVersionBusinessData, assignVersionBusinessSchema } from '@/schemas/admin/version-businesses';

interface AssignBusinessFormProps {
  versionId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AssignBusinessForm: React.FC<AssignBusinessFormProps> = ({ versionId, onSuccess, onCancel }) => {
  const form = useForm<AssignVersionBusinessData>({
    resolver: zodResolver(assignVersionBusinessSchema),
    defaultValues: { businessId: '' },
  });

  const assignMutation = useAssignVersionBusiness({
    onSuccess: () => {
      form.reset();
      onSuccess();
    },
  });

  return (
    <Form form={form} mutation={assignMutation} transformSubmit={(data) => ({ versionId, businessId: data.businessId })}>
      <BusinessSelector name="businessId" params={{ notInVersion: versionId }} />
      <DialogActions>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            form.reset();
            onCancel();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" loadingText="Assigning...">
          Assign Business
        </Button>
      </DialogActions>
    </Form>
  );
};
