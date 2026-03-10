import type { MFAMethod } from '@services/auth.service';
import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { KeyRound, ShieldCheck, Smartphone } from 'lucide-react';
import type React from 'react';

interface MethodSwitcherProps {
  /** Currently active MFA method */
  currentMethod: MFAMethod;
  /** Available MFA methods */
  availableMethods: MFAMethod[];
  /** Callback when a method is selected */
  onMethodChange: (method: MFAMethod) => void;
}

/**
 * Method configuration for display
 */
const METHOD_CONFIG: Record<MFAMethod, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  totp: { icon: ShieldCheck, label: 'Authenticator' },
  sms: { icon: Smartphone, label: 'SMS' },
  passkey: { icon: KeyRound, label: 'Passkey' },
};

/**
 * Method switcher component for MFA verification
 *
 * Displays horizontal divider with "Or use" text and method buttons
 * for switching between available MFA methods.
 */
export const MethodSwitcher: React.FC<MethodSwitcherProps> = ({ currentMethod, availableMethods, onMethodChange }) => {
  // Filter out the current method to show only alternative methods
  const alternativeMethods = availableMethods.filter((method) => method !== currentMethod);

  // Don't render if no alternative methods available
  if (alternativeMethods.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Divider with "Or use" text */}
      <div className="relative flex items-center">
        <div className="flex-grow border-t border-border"></div>
        <Typography variant="body2" intent="muted" className="px-3 bg-card">
          Or use
        </Typography>
        <div className="flex-grow border-t border-border"></div>
      </div>

      {/* Method Buttons */}
      <div className="flex justify-center gap-3">
        {alternativeMethods.map((method) => {
          const config = METHOD_CONFIG[method];
          const Icon = config.icon;

          return (
            <Button
              key={method}
              variant="outline"
              className="w-[127px] h-[65px] border border-border rounded-[12px] flex flex-col items-center justify-center gap-1 p-2"
              onClick={() => onMethodChange(method)}
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Icon className="h-4 w-4 text-foreground" />
              </div>
              <Typography variant="body2" className="text-xs text-foreground font-medium">
                {config.label}
              </Typography>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
