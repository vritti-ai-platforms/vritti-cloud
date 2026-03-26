import { Avatar, AvatarFallback, AvatarImage } from '@vritti/quantum-ui/Avatar';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Upload } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { ProfileFormData } from '@/schemas/cloud/settings';

interface ProfilePictureCardProps {
  form: UseFormReturn<ProfileFormData>;
  isEditing: boolean;
}

// Displays and manages the user's profile picture with URL upload
export const ProfilePictureCard: React.FC<ProfilePictureCardProps> = ({ form, isEditing }) => {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const profilePictureUrl = form.watch('profilePictureUrl');

  const displayName = form.watch('displayName') || '';
  const fullName = form.watch('fullName') || '';

  const handleUploadUrl = () => {
    if (tempUrl) {
      form.setValue('profilePictureUrl', tempUrl);
      setShowUrlInput(false);
      setTempUrl('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>Update your profile picture</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profilePictureUrl || undefined} alt={displayName || fullName || 'User'} />
            <AvatarFallback className="text-lg">
              {(displayName || fullName || 'U').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-3">
            {!showUrlInput ? (
              <>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
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
                      onClick={() => form.setValue('profilePictureUrl', '')}
                      disabled={!isEditing}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <Typography variant="body2" intent="muted" className="text-xs">
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
  );
};
