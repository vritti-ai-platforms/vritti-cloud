import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { BadgeDollarSign, Building2, Cloud, Globe } from 'lucide-react';
import type { Plan } from '@/schemas/admin/plans';

// Stat cards — counts come from the plan API response
export const PlanStats = ({ plan }: { plan: Plan }) => (
  <div className="grid grid-cols-4 gap-4">
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
          <BadgeDollarSign className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Pricing Entries</p>
          <p className="text-2xl font-semibold">{plan.priceCount}</p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
          <Globe className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Regions Covered</p>
          <p className="text-2xl font-semibold">{plan.regionCount}</p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
          <Cloud className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Providers</p>
          <p className="text-2xl font-semibold">{plan.providerCount}</p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Organizations</p>
          <p className="text-2xl font-semibold">{plan.orgCount}</p>
        </div>
      </CardContent>
    </Card>
  </div>
);
