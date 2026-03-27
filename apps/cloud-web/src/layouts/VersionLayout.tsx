import { SidebarLayout } from '@components/sidebar-layout/SidebarLayout';
import { useSlugParams } from '@vritti/quantum-ui/hooks';
import type { SidebarNavGroup } from '@vritti/quantum-ui/Sidebar';
import { AppWindow, Blocks, Boxes, Eye, Shield } from 'lucide-react';
import { useMemo } from 'react';

// Builds sidebar nav groups with version-scoped paths
function useVersionNavGroups(slug: string): SidebarNavGroup[] {
  return useMemo(() => {
    const base = slug ? `/versions/${slug}` : '';
    return [
      {
        label: 'Version',
        items: [
          { title: 'Overview', icon: Eye, path: `${base}/overview` },
          { title: 'Microfrontends', icon: Boxes, path: `${base}/microfrontends` },
          { title: 'Features', icon: Blocks, path: `${base}/features` },
          { title: 'Apps', icon: AppWindow, path: `${base}/apps` },
          { title: 'Role Templates', icon: Shield, path: `${base}/roles` },
        ],
      },
    ];
  }, [slug]);
}

// Layout with sidebar for version-scoped admin pages
export const VersionLayout = () => {
  const { slug, id: versionId } = useSlugParams();

  return <SidebarLayout groups={useVersionNavGroups(slug)} outletContext={{ versionId }} />;
};
