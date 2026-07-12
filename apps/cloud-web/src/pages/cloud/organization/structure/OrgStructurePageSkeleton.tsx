import { PageContent } from '@vritti/quantum-ui/PageContent';
import { PageHeaderSkeleton } from '@vritti/quantum-ui/PageHeader';

export const OrgStructurePageSkeleton = () => (
  <div className="flex flex-col gap-6">
    <PageHeaderSkeleton />
    <PageContent>
      <div className="h-full w-full animate-pulse bg-muted" />
    </PageContent>
  </div>
);
