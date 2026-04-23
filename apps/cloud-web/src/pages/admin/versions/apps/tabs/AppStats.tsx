import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Blocks, Layers } from 'lucide-react';
import type { App } from '@/schemas/admin/apps';

// Stat cards showing feature and plan counts
export const AppStats = ({ app }: { app: App }) => (
  <div className="grid grid-cols-2 gap-4">
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
          <Blocks className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Features</p>
          <p className="text-2xl font-semibold">{app.featureCount}</p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
          <Layers className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Plans</p>
          <p className="text-2xl font-semibold">{app.planCount}</p>
        </div>
      </CardContent>
    </Card>
  </div>
);
