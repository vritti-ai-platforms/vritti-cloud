import { SidebarLayout } from '@components/sidebar-layout/SidebarLayout';
import type { SidebarNavGroup } from '@vritti/quantum-ui/Sidebar';
import { Building2, Cloud, CreditCard, Flag, GitBranch, Globe, Landmark, MapPin, Server } from 'lucide-react';

const navGroups: SidebarNavGroup[] = [
  {
    label: 'Platform',
    items: [
      { title: 'Versions', icon: GitBranch, path: '/versions' },
      { title: 'Deployments', icon: Server, path: '/deployments' },
      { title: 'Organizations', icon: Landmark, path: '/organizations' },
    ],
  },
  {
    label: 'Commercial',
    items: [
      { title: 'Plans', icon: CreditCard, path: '/plans' },
      { title: 'Markets', icon: Globe, path: '/markets' },
      { title: 'Countries', icon: Flag, path: '/countries' },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      { title: 'Businesses', icon: Building2, path: '/businesses' },
      { title: 'Regions', icon: MapPin, path: '/regions' },
      { title: 'Cloud Providers', icon: Cloud, path: '/cloud-providers' },
    ],
  },
];

// Layout with sidebar for admin pages
export const AdminLayout = () => <SidebarLayout groups={navGroups} />;
