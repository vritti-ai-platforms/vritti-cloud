import { SidebarLayout } from '@components/sidebar-layout/SidebarLayout';
import type { SidebarNavGroup } from '@vritti/quantum-ui/Sidebar';
import { Building2, CalendarClock, Cloud, Flag, GitBranch, MapPin, Server } from 'lucide-react';

const navGroups: SidebarNavGroup[] = [
  {
    label: 'Platform',
    items: [
      { title: 'Versions', icon: GitBranch, path: '/versions' },
      { title: 'Deployments', icon: Server, path: '/deployments' },
    ],
  },
  {
    label: 'Commercial',
    items: [
      { title: 'Businesses', icon: Building2, path: '/businesses' },
      { title: 'Countries', icon: Flag, path: '/countries' },
      { title: 'Billing Cycles', icon: CalendarClock, path: '/billing-cycles' },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      { title: 'Regions', icon: MapPin, path: '/regions' },
      { title: 'Cloud Providers', icon: Cloud, path: '/cloud-providers' },
    ],
  },
];

// Layout with sidebar for admin pages
export const AdminLayout = () => <SidebarLayout groups={navGroups} />;
