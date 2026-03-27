import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@vritti/quantum-ui/Button';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Edit } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AccountInformationCard } from '@/components/cloud/account/profile/AccountInformationCard';
import { useDeleteAccount } from '@/hooks/account/profile/useDeleteAccount';
import { useProfile } from '@/hooks/account/profile/useProfile';
import { useUpdateProfile } from '@/hooks/account/profile/useUpdateProfile';
import type { ProfileFormData } from '@/schemas/cloud/account';
import { profileSchema } from '@/schemas/cloud/account';
import { ContactChangeDialog } from './forms/ContactChangeDialog';
import { PersonalInformationCard } from './forms/PersonalInformationCard';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { data: profile, isLoading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const contactDialog = useDialog();
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');

  const updateProfileMutation = useUpdateProfile({
    onSuccess: () => setIsEditing(false),
  });
  const deleteAccountMutation = useDeleteAccount({
    onSuccess: () => navigate('/login'),
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: profile?.fullName || '',
      displayName: profile?.displayName || '',
      phone: profile?.phone ?? '',
      locale: profile?.locale || 'en',
      timezone: profile?.timezone || 'UTC',
    },
  });

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  // Confirms and deletes the account
  async function handleDeleteAccount() {
    const confirmed = await confirm({
      title: 'Delete Account',
      description:
        'Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      confirmLabel: 'Delete Account',
      variant: 'destructive',
    });
    if (confirmed) deleteAccountMutation.mutate();
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <Typography variant="body1" intent="muted">
          Failed to load profile data
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information and account details"
        actions={
          isEditing ? (
            <div className="flex gap-3">
              <Button type="submit" form="profile-form" disabled={updateProfileMutation.isPending}>
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={updateProfileMutation.isPending}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )
        }
      />

      <PersonalInformationCard
        profile={profile}
        form={form}
        mutation={updateProfileMutation}
        isEditing={isEditing}
        onChangeEmail={() => { setContactType('email'); contactDialog.open(); }}
        onChangePhone={() => { setContactType('phone'); contactDialog.open(); }}
      />

      <AccountInformationCard profile={profile} />

      <DangerZone
        title="Delete Account"
        description="Permanently delete your account and all associated data. This action cannot be undone."
        buttonText="Delete Account"
        onClick={handleDeleteAccount}
        disabled={deleteAccountMutation.isPending}
      />

      <ContactChangeDialog
        handle={contactDialog}
        contactType={contactType}
        profile={profile}
      />
    </div>
  );
};
