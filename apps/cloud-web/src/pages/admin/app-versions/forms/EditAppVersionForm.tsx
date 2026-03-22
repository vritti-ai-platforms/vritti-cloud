import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateAppVersion } from '@hooks/admin/app-versions';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { AppVersion } from '@/schemas/admin/app-versions';
import { type UpdateAppVersionData, updateAppVersionSchema } from '@/schemas/admin/app-versions';

interface EditAppVersionFormProps {
  version: AppVersion;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditAppVersionForm: React.FC<EditAppVersionFormProps> = ({ version, onSuccess, onCancel }) => {
  const form = useForm<UpdateAppVersionData>({
    resolver: zodResolver(updateAppVersionSchema),
    defaultValues: {
      version: version.version,
      name: version.name,
    },
  });

  const updateMutation = useUpdateAppVersion({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      showRootError
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({ id: version.id, data })}
    >
      <TextField
        name="version"
        label="Version"
        placeholder="e.g. 1.0.0"
        description="Semver format"
      />
      <TextField name="name" label="Name" placeholder="e.g. Restaurant Suite v1" />
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
