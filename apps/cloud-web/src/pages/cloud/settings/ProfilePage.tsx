import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, AvatarFallback, AvatarImage } from '@vritti/quantum-ui/Avatar';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { PhoneField } from '@vritti/quantum-ui/PhoneField';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { AlertTriangle, Edit, Trash2, Upload } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { EmailVerificationDialog } from '@/components/cloud/settings/EmailVerificationDialog';
import { PhoneVerificationDialog } from '@/components/cloud/settings/PhoneVerificationDialog';
import { useDeleteAccount, useProfile, useUpdateProfile } from '@/hooks/cloud/settings/useProfile';
import type { ProfileFormData } from '@/schemas/cloud/settings';
import { AccountStatus, profileSchema } from '@/schemas/cloud/settings';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const deleteAccountMutation = useDeleteAccount({
    onSuccess: () => {
      // Navigate to login after account deletion
      navigate('/login');
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: profile?.fullName || '',
      displayName: profile?.displayName || '',
      phone: profile?.phone || '',
      locale: profile?.locale || 'en',
      timezone: profile?.timezone || 'UTC',
      profilePictureUrl: profile?.profilePictureUrl || '',
    },
  });

  const handleSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const handleUploadUrl = () => {
    if (tempUrl) {
      form.setValue('profilePictureUrl', tempUrl);
      setShowUrlInput(false);
      setTempUrl('');
    }
  };

  const handleRemovePicture = () => {
    form.setValue('profilePictureUrl', '');
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  const getStatusBadgeVariant = (status: AccountStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case AccountStatus.ACTIVE:
        return 'default'; // Primary color for active
      case AccountStatus.PENDING:
        return 'secondary'; // Secondary for pending
      case AccountStatus.SUSPENDED:
      case AccountStatus.DEACTIVATED:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  const profilePictureUrl = form.watch('profilePictureUrl');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="Profile Settings" description="Manage your personal information and account details" />

      {/* Profile Picture Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Update your profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start">
            <div className="relative">
              <Avatar className="h-24 w-24 shadow-[0px_0px_0px_4px_white,0px_12px_24px_4px_rgba(10,29,54,0.08),0px_4px_6px_-0.75px_rgba(10,29,54,0.08)]">
                <AvatarImage
                  src={profilePictureUrl || undefined}
                  alt={profile.displayName || profile.fullName || 'User'}
                />
                <AvatarFallback className="text-lg">
                  {(profile.displayName || profile.fullName || 'U').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="ml-[120px] flex flex-col gap-3">
              {!showUrlInput ? (
                <>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => setShowUrlInput(true)}
                      disabled={!isEditing}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                    {profilePictureUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={handleRemovePicture}
                        disabled={!isEditing}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <Typography variant="body2" className="text-xs text-muted-foreground leading-4">
                    JPG, PNG or GIF. Max size 2MB.
                  </Typography>
                </>
              ) : (
                <div className="flex gap-2">
                  <TextField
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-80"
                  />
                  <Button type="button" size="sm" onClick={handleUploadUrl}>
                    Apply
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowUrlInput(false);
                      setTempUrl('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </div>
            {!isEditing ? (
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <Form form={form} mutation={updateProfileMutation} onSubmit={handleSubmit}>
            <FieldGroup>
              {/* Full Name and Display Name */}
              <div className="grid grid-cols-2 gap-4">
                <TextField name="fullName" label="Full Name" placeholder="John Doe" disabled={!isEditing} />
                <TextField name="displayName" label="Display Name" placeholder="John" disabled={!isEditing} />
              </div>

              {/* Email with Change Button */}
              <div className="space-y-1">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <TextField label="Email" disabled readOnly value={profile.email} />
                  </div>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 mb-0"
                      onClick={() => setShowEmailDialog(true)}
                    >
                      Change
                    </Button>
                  )}
                </div>
                {isEditing && (
                  <Typography variant="body2" className="text-xs text-muted-foreground">
                    Requires identity verification to change
                  </Typography>
                )}
              </div>

              {/* Phone with Change Button */}
              <div className="space-y-1">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <PhoneField
                      label="Phone Number"
                      defaultCountry="IN"
                      disabled={true}
                      value={(profile.phone || '') as any}
                    />
                  </div>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 mb-0"
                      onClick={() => setShowPhoneDialog(true)}
                    >
                      Change
                    </Button>
                  )}
                </div>
                {isEditing && (
                  <Typography variant="body2" className="text-xs text-muted-foreground">
                    Requires identity verification to change
                  </Typography>
                )}
              </div>

              {/* Locale and Timezone */}
              <div className="grid grid-cols-2 gap-4">
                {/* <SelectField
                  name="locale"
                  label="Language"
                  placeholder="Select a language"
                  options={LOCALES.map((l) => ({ value: l.code, label: l.name }))}
                  disabled={!isEditing}
                />
                <SelectField
                  name="timezone"
                  label="Timezone"
                  placeholder="Select a timezone"
                  options={TIMEZONES.map((tz) => ({
                    value: tz.value,
                    label: `${tz.label} (${tz.offset})`,
                  }))}
                  disabled={!isEditing}
                /> */}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-2">
                  <Button type="submit">Save Changes</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateProfileMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </FieldGroup>
          </Form>
        </CardContent>
      </Card>

      {/* Account Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography variant="body2" intent="muted" className="mb-1">
                  User ID
                </Typography>
                <Typography variant="body1" className="font-mono text-sm">
                  {profile.id}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" intent="muted" className="mb-1">
                  Account Status
                </Typography>
                <Badge variant={getStatusBadgeVariant(profile.accountStatus)}>{profile.accountStatus}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography variant="body2" intent="muted" className="mb-1">
                  Account Created
                </Typography>
                <Typography variant="body1">{formatDate(profile.createdAt)}</Typography>
              </div>
              <div>
                <Typography variant="body2" intent="muted" className="mb-1">
                  Last Login
                </Typography>
                <Typography variant="body1">{formatDateTime(profile.lastLoginAt)}</Typography>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone Card */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Permanently delete your account and all associated data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <Typography variant="body2" className="mb-2">
                Once you delete your account, there is no going back. This action cannot be undone.
              </Typography>
              <Typography variant="body2" intent="muted">
                All your data, including projects, configurations, and settings will be permanently removed.
              </Typography>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteAccountMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle>Delete Account</CardTitle>
                  <CardDescription className="mt-1.5">
                    Are you absolutely sure you want to delete your account? This action cannot be undone and all your
                    data will be permanently removed.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={deleteAccountMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountMutation.isPending}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Email Verification Dialog */}
      <EmailVerificationDialog
        isOpen={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        currentEmail={profile.email}
      />

      {/* Phone Verification Dialog */}
      <PhoneVerificationDialog
        isOpen={showPhoneDialog}
        onClose={() => setShowPhoneDialog(false)}
        currentPhone={profile.phone || ''}
        currentCountry="IN"
      />
    </div>
  );
};
