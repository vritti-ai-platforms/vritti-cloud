import { MethodSwitcher } from '@components/auth/mfa-verification/MethodSwitcher';
import { PasskeyVerification } from '@components/auth/mfa-verification/PasskeyVerification';
import { SMSVerification } from '@components/auth/mfa-verification/SMSVerification';
import { TOTPVerification } from '@components/auth/mfa-verification/TOTPVerification';
import { useVerifyPasskey } from '@hooks/auth';
import type { LoginResponse, MFAChallenge, MFAMethod } from '@services/auth.service';
import { scheduleTokenRefresh, setToken } from '@vritti/quantum-ui/axios';
import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Handles all MFA verification methods (TOTP, SMS, Passkey) via location.state challenge
export const MFAVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get MFA challenge from location state
  const mfaChallenge = location.state?.mfaChallenge as MFAChallenge | undefined;

  // Current active MFA method
  const [activeMethod, setActiveMethod] = useState<MFAMethod>(mfaChallenge?.defaultMethod || 'totp');

  // Redirect to login if no MFA challenge
  useEffect(() => {
    if (!mfaChallenge) {
      navigate('../login', { replace: true });
    }
  }, [mfaChallenge, navigate]);

  // Handle successful MFA verification
  const handleMFASuccess = (response: LoginResponse) => {
    // Store access token
    if (response.accessToken) {
      setToken(response.accessToken);
      if (response.expiresIn) {
        scheduleTokenRefresh(response.expiresIn);
      }
    }

    // Full page reload to refresh auth state and routes
    window.location.href = '/';
  };

  // Passkey verification mutation (kept in page due to WebAuthn flow)
  const passkeyMutation = useVerifyPasskey({
    onSuccess: handleMFASuccess,
  });

  // Handle Passkey verification — hook owns full flow: start → biometric → verify
  const handlePasskeyVerify = () => {
    if (!mfaChallenge) return;
    passkeyMutation.mutate(mfaChallenge.sessionId);
  };

  // Don't render if no challenge (will redirect)
  if (!mfaChallenge) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Back to Login Link */}
      <Button variant="link" className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground" asChild>
        <Link to="../login" className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </Button>

      {/* Header */}
      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Two-factor authentication
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Verify your identity to continue
        </Typography>
      </div>

      {/* Active Verification Method */}
      <div className="pt-2">
        {activeMethod === 'totp' && (
          <TOTPVerification sessionId={mfaChallenge.sessionId} onSuccess={handleMFASuccess} />
        )}

        {activeMethod === 'sms' && (
          <SMSVerification
            sessionId={mfaChallenge.sessionId}
            maskedPhone={mfaChallenge.maskedPhone || '+** *** ****'}
            onSuccess={handleMFASuccess}
          />
        )}

        {activeMethod === 'passkey' && (
          <PasskeyVerification
            onVerify={handlePasskeyVerify}
            isVerifying={passkeyMutation.isPending}
            error={passkeyMutation.error}
          />
        )}
      </div>

      {/* Method Switcher */}
      <MethodSwitcher
        currentMethod={activeMethod}
        availableMethods={mfaChallenge.availableMethods}
        onMethodChange={setActiveMethod}
      />
    </div>
  );
};
