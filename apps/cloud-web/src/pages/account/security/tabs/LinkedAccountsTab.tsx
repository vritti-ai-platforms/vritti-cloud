import { LinkedAccountCard } from '@components/account/security/LinkedAccountCard';
import { SecurityTabCard } from '@components/account/security/SecurityTabCard';
import { useDisconnectProvider, useLinkedAccounts } from '@hooks/account/security';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { Typography } from '@vritti/quantum-ui/Typography';
import type React from 'react';

const ALL_PROVIDERS = ['GOOGLE', 'MICROSOFT', 'APPLE', 'FACEBOOK', 'X'];

export const LinkedAccountsTab: React.FC = () => {
  const { data, isLoading } = useLinkedAccounts();
  const disconnectMutation = useDisconnectProvider();
  const confirm = useConfirm();

  const connectedProviders = new Set(data?.accounts.map((a) => a.provider) ?? []);

  const handleDisconnect = async (provider: string) => {
    const confirmed = await confirm({
      title: 'Disconnect Provider',
      description: `Are you sure you want to disconnect this provider? You won't be able to sign in with it anymore.`,
      confirmLabel: 'Disconnect',
      variant: 'destructive',
    });
    if (confirmed) {
      disconnectMutation.mutate(provider.toLowerCase());
    }
  };

  const handleConnect = (provider: string) => {
    window.location.href = `/api/auth/oauth/${provider.toLowerCase()}`;
  };

  return (
    <SecurityTabCard
      title="Linked Accounts"
      description="Manage OAuth providers connected to your account"
      isLoading={isLoading}
    >
      <div className="space-y-3">
        {ALL_PROVIDERS.map((provider) => {
          const account = data?.accounts.find((a) => a.provider === provider);
          return (
            <LinkedAccountCard
              key={provider}
              provider={provider}
              isConnected={connectedProviders.has(provider)}
              connectedAt={account?.createdAt}
              onConnect={() => handleConnect(provider)}
              onDisconnect={() => handleDisconnect(provider)}
              canDisconnect={data?.canDisconnect ?? false}
              isDisconnecting={disconnectMutation.isPending}
            />
          );
        })}
      </div>
      <Typography variant="body2" intent="muted" className="text-center mt-4">
        Connect providers to enable single sign-on
      </Typography>
    </SecurityTabCard>
  );
};
