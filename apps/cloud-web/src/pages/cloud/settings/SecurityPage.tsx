import { zodResolver } from '@hookform/resolvers/zod';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { PasswordField } from '@vritti/quantum-ui/PasswordField';
import { Separator } from '@vritti/quantum-ui/Separator';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { Switch } from '@vritti/quantum-ui/Switch';
import { Typography } from '@vritti/quantum-ui/Typography';
import { AlertTriangle, CheckCircle, Info, Lock, LogOut, Monitor } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useChangePassword,
  useRevokeAllOtherSessions,
  useRevokeSession,
  useSessions,
} from '@/hooks/cloud/settings/useSecurity';
import type { ChangePasswordFormData } from '@/schemas/cloud/settings';
import { changePasswordSchema } from '@/schemas/cloud/settings';

export const SecurityPage: React.FC = () => {
  const { data: sessions, isLoading: isLoadingSessions } = useSessions();
  const changePasswordMutation = useChangePassword({
    onSuccess: () => {
      // Clear form after successful password change
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    },
  });
  const revokeSessionMutation = useRevokeSession();
  const revokeAllMutation = useRevokeAllOtherSessions();

  const [showRevokeAllDialog, setShowRevokeAllDialog] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const newPassword = passwordForm.watch('newPassword');

  const handlePasswordSubmit = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const handleRevokeSession = (sessionId: string) => {
    revokeSessionMutation.mutate(sessionId, {
      onSuccess: () => {
        setSessionToRevoke(null);
      },
    });
  };

  const handleRevokeAll = () => {
    revokeAllMutation.mutate(undefined, {
      onSuccess: () => {
        setShowRevokeAllDialog(false);
      },
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const currentSession = sessions?.find((s) => s.isCurrent);
  const otherSessions = sessions?.filter((s) => !s.isCurrent);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Security Settings"
        description="Manage your password, authentication methods, and active sessions"
      />

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <Form form={passwordForm} mutation={changePasswordMutation} onSubmit={handlePasswordSubmit}>
            <FieldGroup>
              {/* Current Password */}
              <PasswordField
                name="currentPassword"
                label="Current Password"
                placeholder="Enter current password"
                startAdornment={<Lock className="h-3.5 w-3.5 text-muted-foreground" />}
              />

              {/* New Password */}
              <PasswordField
                name="newPassword"
                label="New Password"
                placeholder="Enter new password"
                startAdornment={<Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                showStrengthIndicator
              />

              {/* Confirm New Password */}
              <PasswordField
                name="confirmNewPassword"
                label="Confirm New Password"
                placeholder="Confirm new password"
                startAdornment={<Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                showMatchIndicator
                matchPassword={newPassword}
              />

              {/* Password Requirements */}
              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <Typography variant="body2" className="font-medium">
                      Password Requirements
                    </Typography>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>At least 8 characters long</li>
                      <li>Contains uppercase and lowercase letters</li>
                      <li>Contains at least one number</li>
                      <li>Contains at least one special character</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Submit Button */}
              <Button type="submit" disabled={changePasswordMutation.isPending}>
                Update Password
              </Button>
            </FieldGroup>
          </Form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication Card (Stubbed) */}
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Typography variant="body1" className="font-medium">
                  Enable MFA
                </Typography>
                <Badge variant="default">Coming Soon</Badge>
              </div>
              <Typography variant="body2" intent="muted">
                Secure your account with time-based one-time passwords (TOTP)
              </Typography>
            </div>
            <Switch
              // checked={false}
              // disabled
              aria-label="Enable two-factor authentication"
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage devices where you're currently signed in</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSessions ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current Session */}
              {currentSession && (
                <div className="border border-border rounded-lg p-4 bg-success/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <Monitor className="h-5 w-5 text-success" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Typography variant="body1" className="font-medium">
                            {currentSession.device}
                          </Typography>
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3" />
                            Current Session
                          </Badge>
                        </div>
                        <Typography variant="body2" intent="muted">
                          {currentSession.location} • {currentSession.ipAddress}
                        </Typography>
                        <Typography variant="body2" intent="muted" className="text-xs">
                          Last active: {getRelativeTime(currentSession.lastActive)}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Sessions */}
              {otherSessions && otherSessions.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    {otherSessions.map((session) => (
                      <div key={session.sessionId} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <Monitor className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <Typography variant="body1" className="font-medium">
                                {session.device}
                              </Typography>
                              <Typography variant="body2" intent="muted">
                                {session.location} • {session.ipAddress}
                              </Typography>
                              <Typography variant="body2" intent="muted" className="text-xs">
                                Last active: {getRelativeTime(session.lastActive)}
                              </Typography>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSessionToRevoke(session.sessionId)}
                            disabled={revokeSessionMutation.isPending}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Revoke
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* No other sessions */}
              {otherSessions && otherSessions.length === 0 && (
                <>
                  <Separator />
                  <div className="text-center py-6">
                    <Typography variant="body2" intent="muted">
                      No other active sessions
                    </Typography>
                  </div>
                </>
              )}

              {/* Sign Out All Button */}
              {otherSessions && otherSessions.length > 0 && (
                <>
                  <Separator />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRevokeAllDialog(true)}
                    disabled={revokeAllMutation.isPending}
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out All Other Sessions
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revoke Session Confirmation Dialog */}
      {sessionToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle>Revoke Session</CardTitle>
                  <CardDescription className="mt-1.5">
                    Are you sure you want to revoke this session? The device will be signed out immediately.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSessionToRevoke(null)}
                  disabled={revokeSessionMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRevokeSession(sessionToRevoke)}
                  disabled={revokeSessionMutation.isPending}
                >
                  Revoke Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revoke All Sessions Confirmation Dialog */}
      {showRevokeAllDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle>Sign Out All Devices</CardTitle>
                  <CardDescription className="mt-1.5">
                    Are you sure you want to sign out from all other devices? All other sessions will be terminated
                    immediately.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRevokeAllDialog(false)}
                  disabled={revokeAllMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleRevokeAll}
                  disabled={revokeAllMutation.isPending}
                >
                  Sign Out All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
