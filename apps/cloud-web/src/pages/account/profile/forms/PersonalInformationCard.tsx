import type { UseMutationResult } from '@tanstack/react-query';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { PhoneField } from '@vritti/quantum-ui/PhoneField';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import type { AxiosError } from 'axios';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { ProfileData, ProfileFormData, UpdateProfileDto } from '@/schemas/cloud/account';

interface PersonalInformationCardProps {
  form: UseFormReturn<ProfileFormData>;
  mutation: UseMutationResult<ProfileData, AxiosError, UpdateProfileDto>;
  isEditing: boolean;
  onChangeEmail: () => void;
  onChangePhone: () => void;
  profile: ProfileData;
}

// Displays editable personal information fields with email/phone change triggers
export const PersonalInformationCard: React.FC<PersonalInformationCardProps> = ({
  form,
  mutation,
  isEditing,
  onChangeEmail,
  onChangePhone,
  profile,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent>
        <Form id="profile-form" form={form} mutation={mutation} showRootError>
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
        </Form>
      </CardContent>
    </Card>
  );
};
