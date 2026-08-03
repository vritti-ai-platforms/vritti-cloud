import { deploymentQueryKey, useRegenerateSigningKey } from '@hooks/admin/deployments';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { Typography } from '@vritti/quantum-ui/Typography';
import { KeyRound, ShieldCheck } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { Deployment, DeploymentSigningKey } from '@/schemas/admin/deployments';
import { SigningKeyReveal } from '../../components/SigningKeyReveal';

interface SigningKeyTabProps {
  deployment: Deployment;
}

export const SigningKeyTab: React.FC<SigningKeyTabProps> = ({ deployment }) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [signingKey, setSigningKey] = useState<DeploymentSigningKey | null>(null);

  const regenerateMutation = useRegenerateSigningKey({
    onSuccess: (response) => {
      setSigningKey(response.data);
      queryClient.invalidateQueries({ queryKey: deploymentQueryKey(deployment.id) });
    },
  });

  const handleRegenerate = async () => {
    const confirmed = await confirm({
      title: 'Regenerate signing key?',
      description:
        "The current key stops verifying immediately — signed licenses and entitlements will fail until the core deployment's LICENSE_PUBLIC_KEY env is updated and the deployment is resynced.",
      confirmLabel: 'Regenerate',
      variant: 'destructive',
    });
    if (confirmed) regenerateMutation.mutate(deployment.id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KeyRound className="size-5" />
            </div>
            <div className="space-y-1">
              <CardTitle>License signing key</CardTitle>
              <CardDescription>The keypair core uses to verify signed licenses and entitlements.</CardDescription>
            </div>
          </div>
          <Badge variant={deployment.hasSigningKey ? 'success' : 'secondary'}>
            {deployment.hasSigningKey ? 'Generated' : 'Not generated'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
          {deployment.hasSigningKey ? (
            <ShieldCheck className="size-5 shrink-0 text-success" />
          ) : (
            <KeyRound className="size-5 shrink-0 text-muted-foreground" />
          )}
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {deployment.hasSigningKey ? 'Keypair active' : 'No keypair generated'}
            </p>
            <Typography variant="body2" intent="muted">
              The public key is shown only once at generation. Regenerating rotates the keypair — the current key stops
              verifying immediately, so core must be updated with the new LICENSE_PUBLIC_KEY and resynced.
            </Typography>
          </div>
        </div>
        {signingKey && <SigningKeyReveal signingKey={signingKey} showResyncNote />}
      </CardContent>
      <CardFooter className="justify-between gap-4 border-t">
        <Typography variant="body2" intent="muted">
          Only regenerate if the current key was lost or needs rotation.
        </Typography>
        <Button
          variant="outline"
          onClick={handleRegenerate}
          isLoading={regenerateMutation.isPending}
          loadingText="Regenerating..."
          startAdornment={<KeyRound className="size-4" />}
        >
          Regenerate Signing Key
        </Button>
      </CardFooter>
    </Card>
  );
};
