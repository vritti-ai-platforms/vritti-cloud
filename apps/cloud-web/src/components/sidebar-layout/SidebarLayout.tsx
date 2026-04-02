import { TopBar } from '@components/top-bar/TopBar';
import { QueryErrorBoundary } from '@vritti/quantum-ui/ErrorBoundary';
import { Sidebar, SidebarInset, type SidebarNavGroup, SidebarProvider } from '@vritti/quantum-ui/Sidebar';
import { Outlet } from 'react-router-dom';

interface SidebarLayoutProps {
  groups: SidebarNavGroup[];
  outletContext?: Record<string, unknown>;
}

// Shared sidebar layout — TopBar, collapsible sidebar, and content area
export const SidebarLayout = ({ groups, outletContext }: SidebarLayoutProps) => {
  return (
    <SidebarProvider>
      <TopBar />
      <Sidebar groups={groups} topOffset={14} />
      <SidebarInset className="pt-14 h-svh overflow-hidden">
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <QueryErrorBoundary>
              <Outlet context={outletContext} />
            </QueryErrorBoundary>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
