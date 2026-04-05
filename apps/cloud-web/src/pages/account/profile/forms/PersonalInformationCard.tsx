import type { UseMutationResult } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@vritti/quantum-ui/Avatar';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { PhoneField } from '@vritti/quantum-ui/PhoneField';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { UploadFile } from '@vritti/quantum-ui/UploadFile';
import type { AxiosError } from 'axios';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { ProfileData, ProfileFormData } from '@/schemas/cloud/account';
import type { SuccessResponse } from '@/services/account/profile.service';

interface PersonalInformationCardProps {
  form: UseFormReturn<ProfileFormData>;
  mutation: UseMutationResult<SuccessResponse, AxiosError, FormData>;
  isEditing: boolean;
  onChangeEmail: () => void;
  onChangePhone: () => void;
  profile: ProfileData;
}

export const PersonalInformationCard: React.FC<PersonalInformationCardProps> = ({
  form,
  mutation,
  isEditing,
  onChangeEmail,
  onChangePhone,
  profile,
}) => {
  const displayName = form.watch('displayName') || '';
  const fullName = form.watch('fullName') || '';
  const initials = (displayName || fullName || 'U').substring(0, 2).toUpperCase();

  return (
    <Form
      id="profile-form"
      form={form}
      mutation={mutation}
      showRootError
      transformSubmit={(data) => {
        const formData = new FormData();
        formData.append('fullName', data.fullName);
        if (data.displayName) formData.append('displayName', data.displayName);
        formData.append('phone', data.phone);
        formData.append('locale', data.locale);
        formData.append('timezone', data.timezone);
        if (data.profilePicture instanceof File) formData.append('file', data.profilePicture);
        return formData;
      }}
    >
      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Update your profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-8">
            {isEditing ? (
              <UploadFile
                accept="image/png,image/jpeg,image/gif"
                anchor="avatar"
                placeholder="Click or drag to upload photo"
                hint="PNG, JPG or GIF. Max size 2MB."
                value={form.watch('profilePicture') as File | undefined}
                onChange={(file) => form.setValue('profilePicture', file as File)}
              />
            ) : (
              <Avatar className="h-20 w-20 shadow-[0px_0px_0px_4px_white,0px_12px_24px_4px_rgba(10,29,54,0.08),0px_4px_6px_-0.75px_rgba(10,29,54,0.08)]">
                {profile.profilePictureUrl && (
                  <AvatarImage src={profile.profilePictureUrl ?? ''} alt={displayName || fullName || 'User'} />
                )}
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
            )}
            <div className="flex flex-col gap-1 pt-2">
              <Typography variant="body2" intent="muted">
                PNG, JPG or GIF. Max size 2MB.
              </Typography>
              {!isEditing && (
                <Typography variant="body2" intent="muted">
                  Enable edit mode to upload a new photo
                </Typography>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <TextField name="fullName" label="Full Name" placeholder="John Doe" disabled={!isEditing} />
              <TextField name="displayName" label="Display Name" placeholder="John" disabled={!isEditing} />
            </div>

            {/* Email with Change Button */}
            <div className="space-y-1">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <TextField label="Email" disabled readOnly value={profile?.email} />
                </div>
                {isEditing && (
                  <Button type="button" variant="outline" size="sm" className="h-10 mb-0" onClick={onChangeEmail}>
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
                  <PhoneField label="Phone Number" defaultCountry="IN" disabled value={profile?.phone} />
                </div>
                {isEditing && (
                  <Button type="button" variant="outline" size="sm" className="h-10 mb-0" onClick={onChangePhone}>
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
          </FieldGroup>
        </CardContent>
      </Card>
    </Form>
  );
};
