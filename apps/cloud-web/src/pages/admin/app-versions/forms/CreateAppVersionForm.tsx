import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateAppVersion } from '@hooks/admin/app-versions';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type CreateAppVersionData, createAppVersionSchema } from '@/schemas/admin/app-versions';

interface CreateAppVersionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateAppVersionForm: React.FC<CreateAppVersionFormProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<CreateAppVersionData>({
    resolver: zodResolver(createAppVersionSchema),
    defaultValues: { version: '', name: '' },
  });

  const createMutation = useCreateAppVersion({ onSuccess });

  return (
    <Form form={form} mutation={createMutation} showRootError resetOnSuccess onCancel={onCancel}>
      <TextField name="version" label="Version" placeholder="e.g. 1.0.0" description="Semantic version number" />
      <TextField name="name" label="Name" placeholder="e.g. Initial Release" />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Creating...">
          Create Version
        </Button>
      </div>
    </Form>
  );
};
