import { SidebarLayout } from '@components/sidebar-layout/SidebarLayout';
import type { SidebarNavGroup } from '@vritti/quantum-ui/Sidebar';
import { Building2, CreditCard, Eye, Layers, Settings, Shield, Users } from 'lucide-react';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

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
          { title: 'Roles & Permissions', icon: Shield, path: `${base}/roles` },
          { title: 'Business Units', icon: Building2, path: `${base}/business-units` },
          { title: 'Applications', icon: Layers, path: `${base}/applications` },
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
  return <SidebarLayout groups={useOrgNavGroups(orgSlug)} />;
};
