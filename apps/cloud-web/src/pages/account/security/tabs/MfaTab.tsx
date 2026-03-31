import {
  useDisableAllMfa,
  useDisableTotp,
  useMfaStatus,
  useRegenerateBackupCodes,
} from '@hooks/account/security';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { Separator } from '@vritti/quantum-ui/Separator';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ChevronRight, Fingerprint, KeyRound, Plus, ShieldCheck, Smartphone } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { BackupCodesDialog } from '../forms/BackupCodesDialog';
import { PasskeySetupDialog } from '../forms/PasskeySetupDialog';
import { TotpSetupDialog } from '../forms/TotpSetupDialog';

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

// Method selection cards shown when MFA is not configured at all
const MethodSelectionView: React.FC<{
  onSelectTotp: () => void;
  onSelectPasskey: () => void;
}> = ({ onSelectTotp, onSelectPasskey }) => {
  const methods = [
    {
      id: 'totp',
      title: 'Authenticator App',
      description: 'Use Google Authenticator, Authy, or similar apps',
      icon: <Smartphone className="h-5 w-5" />,
      onSelect: onSelectTotp,
    },
    {
      id: 'passkey',
      title: 'Passkey / Security Key',
      description: 'Use Face ID, Touch ID, or your device PIN',
      icon: <KeyRound className="h-5 w-5" />,
      badge: 'Recommended',
      onSelect: onSelectPasskey,
    },
  ];

  return (
    <div className="space-y-3">
      {methods.map((method) => (
        <Button
          variant="ghost"
          key={method.id}
          onClick={method.onSelect}
          className="w-full p-4 rounded-lg border-2 border-border hover:border-primary transition-all flex items-center gap-4 text-left group h-auto"
        >
          <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg bg-secondary text-foreground">
            {method.icon}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <Typography variant="body1" className="font-medium text-foreground truncate">
                {method.title}
              </Typography>
              {method.badge && (
                <Badge variant="default" className="shrink-0">
                  {method.badge}
                </Badge>
              )}
            </div>
            <Typography variant="body2" intent="muted" className="text-wrap">
              {method.description}
            </Typography>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Button>
      ))}
    </div>
  );
};

export const MfaTab: React.FC = () => {
  const { data: status, isLoading } = useMfaStatus();
  const confirm = useConfirm();
  const totpDialog = useDialog();
  const passkeyDialog = useDialog();
  const backupCodesDialog = useDialog();
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [backupWarning, setBackupWarning] = useState<string | undefined>();

  const disableTotpMutation = useDisableTotp();
  const disableAllMutation = useDisableAllMfa();
  const regenerateMutation = useRegenerateBackupCodes({
    onSuccess: (response) => {
      setBackupCodes(response.backupCodes);
      setBackupWarning(response.warning);
      backupCodesDialog.open();
    },
  });

  const handleDisableTotp = async () => {
    const confirmed = await confirm({
      title: 'Disable Authenticator App',
      description:
        'Are you sure you want to disable the authenticator app? You can still use other enabled methods.',
      confirmLabel: 'Disable',
      variant: 'destructive',
    });
    if (confirmed) {
      disableTotpMutation.mutate();
    }
  };

  const handleDisableAllMfa = async () => {
    const confirmed = await confirm({
      title: 'Disable All Two-Factor Authentication',
      description:
        'Are you sure you want to disable all two-factor authentication methods? This will remove the extra layer of security from your account.',
      confirmLabel: 'Disable All 2FA',
      variant: 'destructive',
    });
    if (confirmed) {
      disableAllMutation.mutate();
    }
  };

  const handleRegenerateCodes = async () => {
    const confirmed = await confirm({
      title: 'Regenerate Backup Codes',
      description:
        'This will invalidate all existing backup codes and generate new ones. Make sure to save the new codes.',
      confirmLabel: 'Regenerate',
      variant: 'destructive',
    });
    if (confirmed) {
      regenerateMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasTotp = status?.methods.includes('TOTP') ?? false;
  const hasPasskey = status?.methods.includes('PASSKEY') ?? false;
  const hasAnyMfa = status?.isEnabled ?? false;

  // MFA not configured at all — show method selection
  if (!hasAnyMfa) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>Add an extra layer of security to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <MethodSelectionView
              onSelectTotp={totpDialog.open}
              onSelectPasskey={passkeyDialog.open}
            />
            <Typography variant="body2" intent="muted" className="text-center mt-4">
              Email and Phone are already verified and available as backup options
            </Typography>
          </CardContent>
        </Card>

        {totpDialog.isOpen && <TotpSetupDialog handle={totpDialog} />}
        {passkeyDialog.isOpen && <PasskeySetupDialog handle={passkeyDialog} />}
      </>
    );
  }

  // MFA enabled — show per-method management
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-success" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>Manage your two-factor authentication methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Authenticator App */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className={`h-5 w-5 ${hasTotp ? 'text-success' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <Typography variant="body1" className="font-medium">
                        Authenticator App
                      </Typography>
                      {hasTotp && <Badge variant="default">Enabled</Badge>}
                    </div>
                    <Typography variant="body2" intent="muted">
                      {hasTotp ? 'Verify with codes from your authenticator app' : 'Use Google Authenticator, Authy, or similar'}
                    </Typography>
                  </div>
                </div>
                {hasTotp ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={handleDisableTotp}
                    disabled={disableTotpMutation.isPending}
                    isLoading={disableTotpMutation.isPending}
                    loadingText="Disabling..."
                  >
                    Disable
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={totpDialog.open}>
                    <Plus className="h-4 w-4 mr-1" />
                    Set Up
                  </Button>
                )}
              </div>
            </div>

            {/* Passkey */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Fingerprint className={`h-5 w-5 ${hasPasskey ? 'text-success' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <Typography variant="body1" className="font-medium">
                        Passkey / Security Key
                      </Typography>
                      {hasPasskey && (
                        <Badge variant="default">
                          {status?.passkeys?.length ?? 0} registered
                        </Badge>
                      )}
                    </div>
                    <Typography variant="body2" intent="muted">
                      {hasPasskey ? 'Verify with Face ID, Touch ID, or device PIN' : 'Use biometrics or a security key'}
                    </Typography>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={passkeyDialog.open}>
                  <Plus className="h-4 w-4 mr-1" />
                  {hasPasskey ? 'Add' : 'Set Up'}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Backup codes */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <KeyRound className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Typography variant="body1" className="font-medium">
                      Backup Codes
                    </Typography>
                    <Typography variant="body2" intent="muted">
                      {status?.backupCodesRemaining ?? 0} of 10 remaining
                    </Typography>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateCodes}
                  disabled={regenerateMutation.isPending}
                  isLoading={regenerateMutation.isPending}
                  loadingText="Regenerating..."
                >
                  Regenerate
                </Button>
              </div>
            </div>

            {status?.lastUsedAt && (
              <Typography variant="body2" intent="muted" className="text-xs text-center">
                Last used: {getRelativeTime(status.lastUsedAt)}
              </Typography>
            )}

            <Separator />

            {/* Disable all MFA */}
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={handleDisableAllMfa}
              disabled={disableAllMutation.isPending}
              isLoading={disableAllMutation.isPending}
              loadingText="Disabling..."
            >
              Disable All Two-Factor Authentication
            </Button>
          </div>
        </CardContent>
      </Card>

      {totpDialog.isOpen && <TotpSetupDialog handle={totpDialog} />}
      {passkeyDialog.isOpen && <PasskeySetupDialog handle={passkeyDialog} />}
      {backupCodesDialog.isOpen && (
        <BackupCodesDialog
          handle={backupCodesDialog}
          backupCodes={backupCodes}
          warning={backupWarning}
        />
      )}
    </>
  );
};
