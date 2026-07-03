import { QueryErrorBoundary } from '@vritti/quantum-ui/ErrorBoundary';
import { Outlet } from 'react-router-dom';
import { TopBar } from '@/components/top-bar/TopBar';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <main className="flex-1 overflow-auto pt-20 px-0 sm:px-8 lg:px-32 pb-2.5 min-w-70">
        <QueryErrorBoundary>
          <Outlet />
        </QueryErrorBoundary>
      </main>
    </div>
  );
};
