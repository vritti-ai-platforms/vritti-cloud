import { Avatar, AvatarFallback } from '@vritti/quantum-ui/Avatar';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card } from '@vritti/quantum-ui/Card';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { Typography } from '@vritti/quantum-ui/Typography';
import { buildSlug } from '@vritti/quantum-ui/utils/slug';
import { AppWindow, ArrowRight, Building2, Users } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import type { OrgListItem } from '@/schemas/cloud/organizations';
import { OrgMemberRole } from '@/schemas/cloud/organizations';

// Renders a single organization membership card
export const OrgCard: React.FC<{ org: OrgListItem }> = ({ org }) => {
  const navigate = useNavigate();

  // Get 2-letter initials from org name
  const initials = org.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const roleBadgeVariant = org.role === OrgMemberRole.Owner ? 'default' : 'secondary';

  // Format updatedAt date or fall back to dash
  const lastUpdated = org.updatedAt
    ? new Date(org.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <Card className="min-h-[320px] flex flex-col justify-between p-5">
      {/* Header row: avatar + name + role badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Typography variant="body1" className="font-semibold truncate">
              {org.name}
            </Typography>
            <Typography variant="body2" intent="muted" className="font-mono text-xs truncate">
              {org.subdomain}.vrittiai.com
            </Typography>
          </div>
        </div>
        <Badge variant={roleBadgeVariant} className="shrink-0">
          {org.role}
        </Badge>
      </div>

      <div className="border-t border-border" />

      {/* Stats row: BU / Users / Apps */}
      <div className="grid grid-cols-3">
        <div className="flex flex-col items-center gap-1 py-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <Typography variant="body1" className="font-semibold text-sm">
            —
          </Typography>
          <Typography variant="body2" intent="muted" className="text-xs">
            BU
          </Typography>
        </div>
        <div className="flex flex-col items-center gap-1 py-2 border-l border-border">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Typography variant="body1" className="font-semibold text-sm">
            —
          </Typography>
          <Typography variant="body2" intent="muted" className="text-xs">
            Users
          </Typography>
        </div>
        <div className="flex flex-col items-center gap-1 py-2 border-l border-border">
          <AppWindow className="h-4 w-4 text-muted-foreground" />
          <Typography variant="body1" className="font-semibold text-sm">
            —
          </Typography>
          <Typography variant="body2" intent="muted" className="text-xs">
            Apps
          </Typography>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Meta rows: Deployment Name + Last Updated */}
      <div className="space-y-2 py-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Deployment Name</span>
          <span className="text-xs font-medium text-foreground">—</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Last Updated</span>
          <span className="text-xs font-medium text-foreground">{lastUpdated}</span>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* View Dashboard link */}
      <div>
        <Button
          variant="link"
          className="p-0 h-auto text-primary text-sm gap-1"
          onClick={() => navigate(`/org-${buildSlug(org.name, org.id)}/overview`)}
        >
          View <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
};

// Skeleton placeholder displayed while org data is loading
export const OrgCardSkeleton: React.FC = () => (
  <Card className="min-h-[320px] flex flex-col justify-between p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 rounded-full shrink-0" />
    </div>

    <Skeleton className="h-px w-full" />

    <div className="grid grid-cols-3 gap-2 py-1">
      <div className="flex flex-col items-center gap-1">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-3 w-6" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-3 w-8" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-3 w-6" />
      </div>
    </div>

    <Skeleton className="h-px w-full" />

    <div className="space-y-2 py-1">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-6" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>

    <Skeleton className="h-px w-full" />

    <Skeleton className="h-4 w-28" />
  </Card>
);
