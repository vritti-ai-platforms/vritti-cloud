import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Switch } from '@vritti/quantum-ui/Switch';
import { AppWindow, Lock, ShoppingCart } from 'lucide-react';
import type React from 'react';
import type { OrgApp } from '@/schemas/cloud/org-apps';

interface AppCardProps {
  app: OrgApp;
  onToggle: (app: OrgApp) => void;
  onPurchase: (app: OrgApp) => void;
  isToggling: boolean;
}

// Maps app status to a styled badge
function getStatusBadge(status: OrgApp['status']) {
  switch (status) {
    case 'included':
      return { label: 'Included', className: 'bg-success/15 text-success border-success/25' };
    case 'addon':
      return { label: 'Addon', className: 'bg-warning/15 text-warning border-warning/25' };
    case 'unavailable':
      return { label: 'Unavailable', className: 'bg-muted text-muted-foreground' };
    default:
      return { label: status, className: '' };
  }
}

// Card displaying an organization app with toggle/purchase actions
export const AppCard: React.FC<AppCardProps> = ({ app, onToggle, onPurchase, isToggling }) => {
  const badge = getStatusBadge(app.status);
  const isUnavailable = app.status === 'unavailable';

  return (
    <Card className={isUnavailable ? 'opacity-60' : undefined}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
            <AppWindow className="size-5 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold truncate">{app.name}</h3>
              <Badge variant="secondary" className={`text-xs ${badge.className}`}>
                {badge.label}
              </Badge>
            </div>

            {app.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{app.description}</p>
            )}

            {/* Addon pricing */}
            {app.status === 'addon' && app.price && (
              <p className="text-xs text-muted-foreground mb-3">
                {app.price.currency} {app.price.monthlyPrice}
                <span className="text-muted-foreground/70"> / business unit / month</span>
              </p>
            )}

            {/* Unavailable info */}
            {isUnavailable && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3" />
                <span>Not available in your region</span>
              </div>
            )}

            {/* Feature count */}
            {app.features.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {app.features.length} feature{app.features.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="shrink-0">
            {app.status === 'included' && (
              <Switch
                checked={true}
                onCheckedChange={() => onToggle(app)}
                disabled={isToggling}
              />
            )}
            {app.status === 'addon' && (
              <Button
                variant="outline"
                size="sm"
                startAdornment={<ShoppingCart className="size-3.5" />}
                onClick={() => onPurchase(app)}
              >
                Purchase
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
