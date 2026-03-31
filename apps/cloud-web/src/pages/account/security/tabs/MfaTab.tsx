import { BackupCodesCard } from '@components/account/security/BackupCodesCard';
import { MfaMethodCard } from '@components/account/security/MfaMethodCard';
import { MethodSelectionView } from '@components/account/security/MethodSelectionView';
import { SecurityTabCard } from '@components/account/security/SecurityTabCard';
import {
  useDisableAllMfa,
  useDisableTotp,
  useMfaStatus,
  useRegenerateBackupCodes,
} from '@hooks/account/security';
import { getRelativeTime } from '@/utils/getRelativeTime';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { CardTitle } from '@vritti/quantum-ui/Card';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { Separator } from '@vritti/quantum-ui/Separator';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Fingerprint, Plus, ShieldCheck, Smartphone } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { BackupCodesDialog } from '../forms/BackupCodesDialog';
import { PasskeySetupDialog } from '../forms/PasskeySetupDialog';
import { TotpSetupDialog } from '../forms/TotpSetupDialog';

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

  const hasTotp = status?.methods.includes('TOTP') ?? false;
  const hasPasskey = status?.methods.includes('PASSKEY') ?? false;
  const hasAnyMfa = status?.isEnabled ?? false;

  // MFA not configured — show method selection
  if (!hasAnyMfa) {
    return (
      <>
        <SecurityTabCard
          title="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
          isLoading={isLoading}
        >
          <MethodSelectionView onSelectTotp={totpDialog.open} onSelectPasskey={passkeyDialog.open} />
          <Typography variant="body2" intent="muted" className="text-center mt-4">
            Email and Phone are already verified and available as backup options
          </Typography>
        </SecurityTabCard>

        {totpDialog.isOpen && <TotpSetupDialog handle={totpDialog} />}
        {passkeyDialog.isOpen && <PasskeySetupDialog handle={passkeyDialog} />}
      </>
    );
  }

  // MFA enabled — show per-method management
  return (
    <>
      <SecurityTabCard
        title={
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-success" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
        }
        description="Manage your two-factor authentication methods"
      >
        <div className="space-y-4">
          <MfaMethodCard
            icon={<Smartphone className={`h-5 w-5 ${hasTotp ? 'text-success' : 'text-muted-foreground'}`} />}
            title="Authenticator App"
            description={hasTotp ? 'Verify with codes from your authenticator app' : 'Use Google Authenticator, Authy, or similar'}
            badge={hasTotp ? <Badge variant="default">Enabled</Badge> : undefined}
            action={
              hasTotp ? (
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
              )
            }
          />

          <MfaMethodCard
            icon={<Fingerprint className={`h-5 w-5 ${hasPasskey ? 'text-success' : 'text-muted-foreground'}`} />}
            title="Passkey / Security Key"
            description={hasPasskey ? 'Verify with Face ID, Touch ID, or device PIN' : 'Use biometrics or a security key'}
            badge={hasPasskey ? <Badge variant="default">{status?.passkeys?.length ?? 0} registered</Badge> : undefined}
            action={
              <Button variant="outline" size="sm" onClick={passkeyDialog.open}>
                <Plus className="h-4 w-4 mr-1" />
                {hasPasskey ? 'Add' : 'Set Up'}
              </Button>
            }
          />

          <Separator />

          <BackupCodesCard
            remaining={status?.backupCodesRemaining ?? 0}
            total={10}
            onRegenerate={handleRegenerateCodes}
            isRegenerating={regenerateMutation.isPending}
          />

          {status?.lastUsedAt && (
            <Typography variant="body2" intent="muted" className="text-xs text-center">
              Last used: {getRelativeTime(status.lastUsedAt)}
            </Typography>
          )}

          <Separator />

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
      </SecurityTabCard>

      {totpDialog.isOpen && <TotpSetupDialog handle={totpDialog} />}
      {passkeyDialog.isOpen && <PasskeySetupDialog handle={passkeyDialog} />}
      {backupCodesDialog.isOpen && (
        <BackupCodesDialog handle={backupCodesDialog} backupCodes={backupCodes} warning={backupWarning} />
      )}
    </>
  );
};
