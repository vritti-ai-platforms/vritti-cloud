import { QueryErrorBoundary } from '@vritti/quantum-ui/ErrorBoundary';
import { Sidebar, SidebarInset, type SidebarNavGroup, SidebarProvider } from '@vritti/quantum-ui/Sidebar';
import { parseSlug } from '@vritti/quantum-ui/utils/slug';
import { AppWindow, Blocks, Boxes, Eye, Shield } from 'lucide-react';
import { useMemo } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { TopBar } from './TopBar';

// Builds sidebar nav groups with version-scoped paths
function useVersionNavGroups(versionSlug?: string): SidebarNavGroup[] {
  return useMemo(() => {
    const base = versionSlug ? `/app-versions/${versionSlug}` : '';
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
  }, [versionSlug]);
}

// Layout with sidebar for version-scoped admin pages
export const VersionLayout = () => {
  const { versionSlug } = useParams<{ versionSlug: string }>();
  const navGroups = useVersionNavGroups(versionSlug);

  // Extract the UUID from the ver-name~uuid slug for child pages
  const parsed = versionSlug ? parseSlug(versionSlug.replace(/^ver-/, '')) : null;
  const versionId = parsed?.id ?? versionSlug ?? '';

  return (
    <SidebarProvider>
      <TopBar />
      <Sidebar groups={navGroups} topOffset={14} />
      <SidebarInset className="pt-14">
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <QueryErrorBoundary>
              <Outlet context={{ versionId }} />
            </QueryErrorBoundary>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
