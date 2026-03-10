import { Alert } from '@vritti/quantum-ui/Alert';
import { Button } from '@vritti/quantum-ui/Button';
import { useSSE } from '@vritti/quantum-ui/hooks';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { Typography } from '@vritti/quantum-ui/Typography';
import { AlertCircle, ArrowLeft, TimerOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type VerificationEventMap = {
  initiated: { verificationCode: string; instructions: string; expiresAt: string; recipientNumber?: string };
  verified: { phone: string };
  error: { message: string };
  expired: { message: string };
};

const SSE_EVENTS: (keyof VerificationEventMap)[] = ['initiated', 'verified', 'error', 'expired'];

interface QRVerificationStepProps {
  method: 'whatsapp' | 'sms';
  onSuccess: (phoneNumber: string) => void;
  onBack: () => void;
}

// Builds a WhatsApp or SMS deep-link URL from the verification code
function buildQrUrl(method: 'whatsapp' | 'sms', verificationCode: string, recipientNumber?: string): string {
  if (method === 'whatsapp') {
    return `https://wa.me/${recipientNumber}?text=${encodeURIComponent(verificationCode)}`;
  }
  return recipientNumber
    ? `sms:${recipientNumber}?body=${encodeURIComponent(verificationCode)}`
    : `sms:?body=${encodeURIComponent(verificationCode)}`;
}

// Formats a phone number string with + prefix for display
function formatWhatsAppNumber(number: string): string {
  return number.startsWith('+') ? number : `+${number}`;
}

// Shared back link used by all event states
const BackLink: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Link
    to="#"
    onClick={(e) => {
      e.preventDefault();
      onBack();
    }}
    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
  >
    <ArrowLeft className="h-4 w-4" />
    Back to methods
  </Link>
);

// Inner component that manages a single SSE session
const QRVerificationInner: React.FC<QRVerificationStepProps & { onRetry: () => void }> = ({
  method,
  onSuccess,
  onBack,
  onRetry,
}) => {
  const { eventType, data, eventTypes, isConnected } = useSSE<VerificationEventMap>({
    path: `/cloud-api/onboarding/mobile-verification/events/${method}`,
    events: SSE_EVENTS,
    autoReconnect: false,
  });

  // Navigate on verification success
  useEffect(() => {
    if (eventType === eventTypes.VERIFIED) {
      onSuccess((data as VerificationEventMap['verified']).phone);
    }
  }, [eventType, data, eventTypes, onSuccess]);

  const initiatedData = data as VerificationEventMap['initiated'];

  // Show loading only before the first event arrives
  if (!eventType) {
    const message = !isConnected
      ? method === 'whatsapp'
        ? 'Connecting to WhatsApp verification...'
        : 'Connecting to SMS verification...'
      : method === 'whatsapp'
        ? 'Setting up WhatsApp verification...'
        : 'Setting up SMS verification...';

    return (
      <div className="flex flex-col flex-1 min-h-[40svh]">
        <BackLink onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Spinner className="size-8 text-primary" />
          <Typography variant="body2" align="center" intent="muted">
            {message}
          </Typography>
        </div>
      </div>
    );
  }

  switch (eventType) {
    case eventTypes.INITIATED:
      return (
        <div className="space-y-6">
          <BackLink onBack={onBack} />
          <div className="text-center space-y-2">
            <Typography variant="h3" align="center" className="text-foreground">
              Scan QR Code with Mobile
            </Typography>
            <Typography variant="body2" align="center" intent="muted">
              Scan this QR code to send the verification message
            </Typography>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                <QRCodeSVG
                  value={buildQrUrl(method, initiatedData.verificationCode, initiatedData.recipientNumber)}
                  size={180}
                />
              </div>
            </div>

            <div className="text-center space-y-2">
              <Typography variant="body2" align="center" intent="muted">
                Or send this code manually:
              </Typography>
              <Typography variant="h4" align="center" className="text-foreground font-mono">
                {initiatedData.verificationCode}
              </Typography>
              {initiatedData.recipientNumber && (
                <Typography variant="body2" align="center" intent="muted">
                  Send to {method === 'whatsapp' ? 'WhatsApp' : 'SMS'} number{' '}
                  <span className="font-medium text-foreground">
                    {formatWhatsAppNumber(initiatedData.recipientNumber)}
                  </span>
                </Typography>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 py-2">
              <Spinner className="size-4 text-primary" />
              <Typography variant="body2" intent="muted">
                Waiting for verification...
              </Typography>
            </div>
          </div>
        </div>
      );

    case eventTypes.VERIFIED:
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <Spinner className="size-8 text-primary" />
        </div>
      );

    case eventTypes.ERROR:
      return (
        <div className="text-center space-y-6">
          <div className="text-left">
            <BackLink onBack={onBack} />
          </div>
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/15">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <div className="space-y-4">
            <Typography variant="h4" align="center" className="text-foreground">
              Verification Failed
            </Typography>
            <Alert variant="destructive" title="Error" description={(data as VerificationEventMap['error']).message} />
          </div>
          <Button onClick={onRetry} className="w-full">
            Try Again
          </Button>
          <Typography variant="caption" align="center" intent="muted">
            If you continue to experience issues, try a different verification method.
          </Typography>
        </div>
      );

    case eventTypes.EXPIRED:
      return (
        <div className="text-center space-y-6">
          <div className="text-left">
            <BackLink onBack={onBack} />
          </div>
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-warning/15">
              <TimerOff className="h-8 w-8 text-warning" />
            </div>
          </div>
          <div className="space-y-4">
            <Typography variant="h4" align="center" className="text-foreground">
              Verification Expired
            </Typography>
            <Alert
              variant="warning"
              title="Time's up"
              description={(data as VerificationEventMap['expired']).message}
            />
          </div>
          <Button onClick={onRetry} className="w-full">
            Try Again
          </Button>
          <Typography variant="caption" align="center" intent="muted">
            If you continue to experience issues, try a different verification method.
          </Typography>
        </div>
      );

    default:
      return null;
  }
};

// Outer component that handles retry by remounting the inner component
export const QRVerificationStep: React.FC<QRVerificationStepProps> = (props) => {
  const [retryKey, setRetryKey] = useState(0);

  // Remounts the inner component to re-establish SSE
  const handleRetry = () => setRetryKey((k) => k + 1);

  return <QRVerificationInner key={retryKey} {...props} onRetry={handleRetry} />;
};
