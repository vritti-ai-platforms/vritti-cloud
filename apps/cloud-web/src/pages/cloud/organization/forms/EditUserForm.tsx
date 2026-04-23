import { zodResolver } from '@hookform/resolvers/zod';
import { ORG_USERS_QUERY_KEY } from '@hooks/cloud/organizations/useOrgUsers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { LocaleSelector } from '@vritti/quantum-ui/selects/locale';
import { TimezoneSelector } from '@vritti/quantum-ui/selects/timezone';
import { TextField } from '@vritti/quantum-ui/TextField';
import type { AxiosError } from 'axios';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { NexusUser } from '@/schemas/cloud/organizations';
import { type SuccessResponse, updateOrgUser } from '@/services/cloud/organizations.service';

const editUserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED']),
  locale: z.string().trim().min(2, 'Locale is required'),
  timezone: z.string().trim().min(1, 'Timezone is required'),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserFormProps {
  orgId: string;
  user: NexusUser;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditUserForm: React.FC<EditUserFormProps> = ({ orgId, user, onSuccess, onCancel }) => {
  const queryClient = useQueryClient();

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: user.fullName,
      status: user.status as EditUserFormData['status'],
      locale: user.locale || 'en-US',
      timezone: user.timezone || 'UTC',
    },
  });

  const mutation = useMutation<SuccessResponse, AxiosError, EditUserFormData>({
    mutationFn: (data) => updateOrgUser(orgId, user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_USERS_QUERY_KEY(orgId) });
      onSuccess();
    },
  });

  return (
    <Form form={form} mutation={mutation}>
      <TextField name="fullName" label="Full Name" placeholder="e.g. Jane Smith" />
      <Select
        name="status"
        label="Status"
        options={[
          { value: 'PENDING', label: 'Pending' },
          { value: 'ACTIVE', label: 'Active' },
          { value: 'SUSPENDED', label: 'Suspended' },
        ]}
      />
      <LocaleSelector name="locale" label="Locale" placeholder="Select locale" />
      <TimezoneSelector name="timezone" label="Timezone" placeholder="Select timezone" />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </div>
    </Form>
  );
};
