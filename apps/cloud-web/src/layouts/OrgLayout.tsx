import { SidebarLayout } from '@components/sidebar-layout/SidebarLayout';
import type { SidebarNavGroup } from '@vritti/quantum-ui/Sidebar';
import { Building2, CreditCard, Layers, Shield, Users } from 'lucide-react';
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
          { title: 'Users', icon: Users, path: `${base}/users` },
          { title: 'Roles', icon: Shield, path: `${base}/roles` },
          { title: 'Structure', icon: Building2, path: `${base}/structure` },
          { title: 'Plan', icon: Layers, path: `${base}/plan` },
        ],
      },
      {
        label: 'Account',
        items: [{ title: 'Billing', icon: CreditCard, path: `${base}/billing` }],
      },
    ];
  }, [orgSlug]);
}

// Layout with sidebar for organization-scoped pages
export const OrgLayout = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  return <SidebarLayout groups={useOrgNavGroups(orgSlug)} />;
};
