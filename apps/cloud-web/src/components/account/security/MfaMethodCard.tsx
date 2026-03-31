import { Typography } from '@vritti/quantum-ui/Typography';
import type React from 'react';

interface MfaMethodCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: React.ReactNode;
  action: React.ReactNode;
}

export const MfaMethodCard: React.FC<MfaMethodCardProps> = ({ icon, title, description, badge, action }) => (
  <div className="border border-border rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="flex items-center gap-2">
            <Typography variant="body1" className="font-medium">
              {title}
            </Typography>
            {badge}
          </div>
          <Typography variant="body2" intent="muted">
            {description}
          </Typography>
        </div>
      </div>
      {action}
    </div>
  </div>
);
