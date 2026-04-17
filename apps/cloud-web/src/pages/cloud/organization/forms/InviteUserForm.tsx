import { zodResolver } from '@hookform/resolvers/zod';
import { useInviteUser } from '@hooks/cloud/organizations/useInviteUser';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { PhoneField } from '@vritti/quantum-ui/PhoneField';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type InviteUserFormData, inviteUserSchema } from '@/schemas/cloud/organizations';

interface InviteUserFormProps {
  orgId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const InviteUserForm: React.FC<InviteUserFormProps> = ({ orgId, onSuccess, onCancel }) => {
  const form = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { email: '', fullName: '', phone: undefined },
  });

  const inviteMutation = useInviteUser(orgId, {
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
      mutation={inviteMutation}
     
      transformSubmit={(data) => ({
        email: data.email,
        fullName: data.fullName,
        ...(data.phone?.number && {
          phone: data.phone.number,
          phoneCountry: data.phone.country,
        }),
      })}
    >
      <TextField name="fullName" label="Full Name" placeholder="e.g. Jane Smith" />
      <TextField name="email" label="Email" placeholder="e.g. jane@example.com" />
      <PhoneField name="phone" label="Phone Number" defaultCountry="IN" />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Inviting...">
          Send Invite
        </Button>
      </div>
    </Form>
  );
};
