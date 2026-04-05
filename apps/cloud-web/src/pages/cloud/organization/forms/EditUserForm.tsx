import { zodResolver } from '@hookform/resolvers/zod';
import { ORG_USERS_QUERY_KEY } from '@hooks/cloud/organizations/useOrgUsers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { NexusUser } from '@/schemas/cloud/organizations';
import { type SuccessResponse, updateOrgUser } from '@/services/cloud/organizations.service';

const editUserSchema = z.object({
  email: z.string().email('Valid email is required'),
  fullName: z.string().min(1, 'Full name is required'),
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
    defaultValues: { email: user.email, fullName: user.fullName },
  });

  const mutation = useMutation<SuccessResponse, AxiosError, EditUserFormData>({
    mutationFn: (data) => updateOrgUser(orgId, user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_USERS_QUERY_KEY(orgId) });
      onSuccess();
    },
  });

  return (
    <Form form={form} mutation={mutation} showRootError>
      <TextField name="fullName" label="Full Name" placeholder="e.g. Jane Smith" />
      <TextField name="email" label="Email" placeholder="e.g. jane@example.com" />
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
