import { Typography } from '@vritti/quantum-ui/Typography';
import type React from 'react';

export const AuthDivider: React.FC<{ text?: string }> = ({ text = 'or continue with' }) => {
  return (
    <div className="relative flex items-center">
      <div className="flex-grow border-t border-border"></div>
      <Typography variant="body2" intent="muted" className="px-2 bg-card">
        {text}
      </Typography>
      <div className="flex-grow border-t border-border"></div>
    </div>
  );
};
