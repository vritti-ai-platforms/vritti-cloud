import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { AlertCircle, KeyRound } from 'lucide-react';
import type React from 'react';

interface PasskeyVerificationProps {
  /** Callback when passkey verification is triggered */
  onVerify: () => void;
  /** Whether verification is in progress */
  isVerifying: boolean;
  /** Error object to display */
  error: Error | null;
}

/**
 * Get user-friendly error message from WebAuthn errors
 */
const getErrorMessage = (error: Error | null): string | null => {
  if (!error) return null;

  // Handle WebAuthn-specific errors
  if (error.name === 'NotAllowedError') {
    return 'Passkey verification was cancelled. Please try again.';
  }
  if (error.name === 'NotSupportedError') {
    return 'Passkeys are not supported on this device or browser.';
  }
  if (error.name === 'SecurityError') {
    return 'Security error. Please ensure you are on a secure connection.';
  }
  if (error.name === 'InvalidStateError') {
    return 'The passkey is not valid for this account.';
  }
  if (error.name === 'AbortError') {
    return 'The operation was cancelled. Please try again.';
  }

  return error.message || 'An unexpected error occurred.';
};

/**
 * Passkey verification component for MFA login
 *
 * Displays key icon and triggers biometric/security key verification.
 */
export const PasskeyVerification: React.FC<PasskeyVerificationProps> = ({ onVerify, isVerifying, error }) => {
  const errorMessage = getErrorMessage(error);

  return (
    <div className="space-y-6">
      {/* Icon Container */}
      <div className="flex justify-center">
        <div className="w-[52px] h-[52px] rounded-full bg-primary/10 flex items-center justify-center">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
      </div>

      {/* Description */}
      <Typography variant="body2" align="center" intent="muted">
        {isVerifying ? 'Follow the prompts on your device...' : 'Use your biometric or security key to verify'}
      </Typography>

      {/* Error Display */}
      {errorMessage && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <Typography variant="body2" className="text-destructive">
            {errorMessage}
          </Typography>
        </div>
      )}

      {/* Verify Button */}
      <Button
        onClick={onVerify}
        className="w-full h-9 rounded-[10px] bg-primary text-primary-foreground"
        isLoading={isVerifying}
        loadingText="Verifying..."
      >
        Verify with passkey
      </Button>
    </div>
  );
};
