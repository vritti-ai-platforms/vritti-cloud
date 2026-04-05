import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateVersion } from '@hooks/admin/versions';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type CreateVersionData, createVersionSchema } from '@/schemas/admin/versions';

interface CreateVersionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateVersionForm: React.FC<CreateVersionFormProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<CreateVersionData>({
    resolver: zodResolver(createVersionSchema),
    defaultValues: { version: '', name: '' },
  });

  const createMutation = useCreateVersion({ onSuccess });

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
