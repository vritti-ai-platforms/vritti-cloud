import { Button } from '@vritti/quantum-ui/Button';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Building2, Plus } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { OrgCard, OrgCardSkeleton } from '@/components/cloud/organizations/OrgCard';
import { useMyOrgs } from '@/hooks/cloud/organizations';

// Full org list page — no truncation limit
export const OrganizationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useMyOrgs();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeader
        title="My Organizations"
        description="Manage your organizations and their configurations"
        actions={
          <Button startAdornment={<Plus />} onClick={() => navigate('/new-organization')}>
            New Organization
          </Button>
        }
      />

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <OrgCardSkeleton />
            <OrgCardSkeleton />
            <OrgCardSkeleton />
          </>
        ) : data?.result && data.result.length > 0 ? (
          data.result.map((org) => <OrgCard key={org.id} org={org} />)
        ) : (
          <div className="col-span-full py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Typography variant="body1" intent="muted">
              You don't belong to any organizations yet.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};
