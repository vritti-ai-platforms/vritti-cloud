import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ChevronRight, MessageSquare, Phone, QrCode } from 'lucide-react';
import type React from 'react';

interface MethodSelectionStepProps {
  onMethodSelect: (method: 'whatsapp' | 'sms' | 'manual') => void;
}

// Display 3 method cards and emit selection to parent
export const MethodSelectionStep: React.FC<MethodSelectionStepProps> = ({ onMethodSelect }) => {
  const methods = [
    {
      id: 'whatsapp' as const,
      title: 'WhatsApp QR Code',
      description: 'Scan QR code with WhatsApp',
      icon: <MessageSquare className="h-5 w-5" />,
      badge: 'Recommended',
    },
    {
      id: 'sms' as const,
      title: 'SMS QR Code',
      description: 'Scan QR code with SMS app',
      icon: <QrCode className="h-5 w-5" />,
    },
    {
      id: 'manual' as const,
      title: 'Enter mobile number',
      description: 'Receive OTP via SMS',
      icon: <Phone className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Verify your mobile
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Choose verification method
        </Typography>
      </div>

      <div className="space-y-3">
        {methods.map((method) => (
          <Button
            variant="ghost"
            key={method.id}
            onClick={() => onMethodSelect(method.id)}
            className="w-full p-4 rounded-lg border-2 border-border hover:border-primary transition-all flex items-center gap-4 text-left group h-auto"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-foreground">
              {method.icon}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Typography variant="body1" className="font-medium text-foreground">
                  {method.title}
                </Typography>
                {method.badge && <Badge variant="default">{method.badge}</Badge>}
              </div>
              <Typography variant="body2" intent="muted">
                {method.description}
              </Typography>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Button>
        ))}
      </div>
    </div>
  );
};
