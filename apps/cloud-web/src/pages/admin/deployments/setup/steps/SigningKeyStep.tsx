import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowRight, KeyRound } from 'lucide-react';
import type React from 'react';
import type { Deployment, DeploymentSigningKey } from '@/schemas/admin/deployments';
import { SigningKeyReveal } from '../../components/SigningKeyReveal';

interface SigningKeyStepProps {
  deployment: Deployment;
  signingKey: DeploymentSigningKey | null;
  onGenerate: () => void;
  isGenerating: boolean;
  onContinue: () => void;
}

export const SigningKeyStep: React.FC<SigningKeyStepProps> = ({
  deployment,
  signingKey,
  onGenerate,
  isGenerating,
  onContinue,
}) => (
  <Card>
    <CardContent className="flex flex-col gap-4 py-6">
      <div className="space-y-1">
        <Typography variant="h6">Generate signing key</Typography>
        <Typography variant="body2" intent="muted">
          Generate this deployment's keypair. Its public key is embedded in core-server as the license key so it can
          verify signed catalog + entitlement pushes from cloud. Generate it before continuing so the stack provisions
          with the real key.
        </Typography>
      </div>

      {signingKey ? (
        <>
          <SigningKeyReveal signingKey={signingKey} />
          <div className="flex justify-end">
            <Button onClick={onContinue} endAdornment={<ArrowRight className="size-4" />}>
              Continue
            </Button>
          </div>
        </>
      ) : deployment.hasSigningKey ? (
        <>
          <Typography variant="body2" intent="muted">
            Signing key already generated — regenerate if you've lost it (takes effect on the next provision).
          </Typography>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onGenerate}
              isLoading={isGenerating}
              loadingText="Regenerating..."
              startAdornment={<KeyRound className="size-4" />}
            >
              Regenerate Signing Key
            </Button>
            <Button onClick={onContinue} endAdornment={<ArrowRight className="size-4" />}>
              Continue
            </Button>
          </div>
        </>
      ) : (
        <div className="flex justify-end">
          <Button
            onClick={onGenerate}
            isLoading={isGenerating}
            loadingText="Generating..."
            startAdornment={<KeyRound className="size-4" />}
          >
            Generate Signing Key
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);
