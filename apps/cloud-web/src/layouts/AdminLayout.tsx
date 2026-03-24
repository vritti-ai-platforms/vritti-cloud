import { SidebarLayout } from '@components/sidebar-layout/SidebarLayout';
import type { SidebarNavGroup } from '@vritti/quantum-ui/Sidebar';
import { Building2, Cloud, CreditCard, GitBranch, Landmark, MapPin, Server } from 'lucide-react';

const navGroups: SidebarNavGroup[] = [
  {
    label: 'Platform',
    items: [
      { title: 'App Versions', icon: GitBranch, path: '/app-versions' },
      { title: 'Deployments', icon: Server, path: '/deployments' },
      { title: 'Organizations', icon: Landmark, path: '/organizations' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { title: 'Industries', icon: Building2, path: '/industries' },
      { title: 'Regions', icon: MapPin, path: '/regions' },
      { title: 'Cloud Providers', icon: Cloud, path: '/cloud-providers' },
      { title: 'Plans', icon: CreditCard, path: '/plans' },
    ],
  },
];

// Layout with sidebar for admin pages
export const AdminLayout = () => <SidebarLayout groups={navGroups} />;
