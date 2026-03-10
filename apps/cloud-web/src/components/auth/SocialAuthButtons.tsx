import { Button } from '@vritti/quantum-ui/Button';
import type React from 'react';
import { AppleIcon } from '../icons/AppleIcon';
import { FacebookIcon } from '../icons/FacebookIcon';
import { GoogleIcon } from '../icons/GoogleIcon';
import { MicrosoftIcon } from '../icons/MicrosoftIcon';
import { XIcon } from '../icons/XIcon';

interface SocialButtonProps {
  provider: 'google' | 'x' | 'facebook' | 'apple' | 'microsoft';
  onClick?: () => void;
}

const SocialButton: React.FC<SocialButtonProps> = ({ provider, onClick }) => {
  const providerConfig = {
    google: {
      icon: <GoogleIcon className="h-6 w-6" />,
      label: 'Google',
      bgColor: 'bg-card',
      hoverColor: 'hover:bg-secondary',
      textColor: 'text-card-foreground',
      borderColor: 'border-border',
    },
    facebook: {
      icon: <FacebookIcon className="h-6 w-6" />,
      label: 'Facebook',
      bgColor: 'bg-card',
      hoverColor: 'hover:bg-secondary',
      textColor: 'text-card-foreground',
      borderColor: 'border-transparent',
    },
    x: {
      icon: <XIcon className="h-6 w-6" />,
      label: 'X',
      bgColor: 'bg-card',
      hoverColor: 'hover:bg-secondary',
      textColor: 'text-card-foreground',
      borderColor: 'border-transparent',
    },
    apple: {
      icon: <AppleIcon className="h-6 w-6" />,
      label: 'Apple',
      bgColor: 'bg-card',
      hoverColor: 'hover:bg-secondary',
      textColor: 'text-card-foreground',
      borderColor: 'border-transparent',
    },
    microsoft: {
      icon: <MicrosoftIcon className="h-6 w-6" />,
      label: 'Microsoft',
      bgColor: 'bg-card',
      hoverColor: 'hover:bg-secondary',
      textColor: 'text-card-foreground',
      borderColor: 'border-border',
    },
  };

  const config = providerConfig[provider];

  return (
    <Button
      variant="outline"
      className={`w-12 h-12 p-0 flex items-center justify-center ${config.bgColor} ${config.hoverColor} ${config.textColor} ${config.borderColor} transition-colors`}
      onClick={onClick}
      aria-label={`Sign in with ${config.label}`}
    >
      {config.icon}
    </Button>
  );
};

export const SocialAuthButtons: React.FC = () => {
  const handleOAuthLogin = (provider: string) => {
    // ZERO ENVIRONMENT VARIABLES APPROACH:
    // Use relative /api path - works in both development and production
    // Dev: Rsbuild proxy forwards /api/* to localhost:3000
    // Prod: Nginx proxy forwards /api/* to backend service
    window.location.href = `/api/cloud-api/auth/oauth/${provider}`;
  };

  return (
    <div className="flex gap-3 w-full justify-center">
      <SocialButton provider="google" onClick={() => handleOAuthLogin('google')} />
      <SocialButton provider="x" onClick={() => handleOAuthLogin('x')} />
      <SocialButton provider="facebook" onClick={() => handleOAuthLogin('facebook')} />
      {/* <SocialButton provider="apple" onClick={() => handleOAuthLogin('apple')} /> */}
      <SocialButton provider="microsoft" onClick={() => handleOAuthLogin('microsoft')} />
    </div>
  );
};
