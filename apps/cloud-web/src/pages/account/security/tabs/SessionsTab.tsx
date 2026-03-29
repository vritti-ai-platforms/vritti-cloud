import { useRevokeAllSessions, useRevokeSession, useSessions } from '@hooks/account/security';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { Separator } from '@vritti/quantum-ui/Separator';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { Typography } from '@vritti/quantum-ui/Typography';
import { CheckCircle, LogOut, Monitor } from 'lucide-react';

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

export const SessionsTab: React.FC = () => {
  const { data: sessions, isLoading } = useSessions();
  const revokeSessionMutation = useRevokeSession();
  const revokeAllMutation = useRevokeAllSessions();
  const confirm = useConfirm();

  const currentSession = sessions?.find((s) => s.isCurrent);
  const otherSessions = sessions?.filter((s) => !s.isCurrent);

  const handleRevokeSession = async (sessionId: string) => {
    const confirmed = await confirm({
      title: 'Revoke Session',
      description: 'Are you sure you want to revoke this session? The device will be signed out immediately.',
      confirmLabel: 'Revoke Session',
      variant: 'destructive',
    });
    if (confirmed) {
      revokeSessionMutation.mutate(sessionId);
    }
  };

  const handleRevokeAll = async () => {
    const confirmed = await confirm({
      title: 'Sign Out All Devices',
      description:
        'Are you sure you want to sign out from all other devices? All other sessions will be terminated immediately.',
      confirmLabel: 'Sign Out All',
      variant: 'destructive',
    });
    if (confirmed) {
      revokeAllMutation.mutate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>Manage devices where you're currently signed in</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
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
                          onClick={() => handleRevokeSession(session.sessionId)}
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

            {otherSessions && otherSessions.length > 0 && (
              <>
                <Separator />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRevokeAll}
                  disabled={revokeAllMutation.isPending}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out All Sessions
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
