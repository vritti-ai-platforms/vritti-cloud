import { QueryErrorBoundary } from '@vritti/quantum-ui/ErrorBoundary';
import { Sidebar, SidebarInset, type SidebarNavGroup, SidebarProvider } from '@vritti/quantum-ui/Sidebar';
import { Building2, CreditCard, Eye, Layers, Settings, Shield, Users } from 'lucide-react';
import { useMemo } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { TopBar } from './TopBar';

// Builds sidebar nav groups with org-scoped paths
function useOrgNavGroups(orgSlug?: string): SidebarNavGroup[] {
  return useMemo(() => {
    const base = orgSlug ? `/${orgSlug}` : '';
    return [
      {
        label: 'Organization',
        items: [
          { title: 'Overview', icon: Eye, path: `${base}/overview` },
          { title: 'Users', icon: Users, path: `${base}/users` },
          {
            title: 'Roles & Permissions',
            icon: Shield,
            path: `${base}/roles`,
          },
          {
            title: 'Business Units',
            icon: Building2,
            path: `${base}/business-units`,
          },
          {
            title: 'Applications',
            icon: Layers,
            path: `${base}/applications`,
          },
        ],
      },
      {
        label: 'Account',
        items: [
          { title: 'Billing', icon: CreditCard, path: `${base}/billing` },
          { title: 'Settings', icon: Settings, path: `${base}/settings` },
        ],
      },
    ];
  }, [orgSlug]);
}

// Layout with sidebar for organization-scoped pages
export const OrgLayout = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const navGroups = useOrgNavGroups(orgSlug);

  return (
    <SidebarProvider>
      <TopBar />
      <Sidebar groups={navGroups} topOffset={14} />
      <SidebarInset className="pt-14">
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <QueryErrorBoundary>
              <Outlet />
            </QueryErrorBoundary>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
