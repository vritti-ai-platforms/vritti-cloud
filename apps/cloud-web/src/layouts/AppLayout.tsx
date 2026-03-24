import { TopBar } from '@components/top-bar/TopBar';
import { QueryErrorBoundary } from '@vritti/quantum-ui/ErrorBoundary';
import { Outlet } from 'react-router-dom';


export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <main className="flex-1 overflow-auto pt-20 px-0 sm:px-8 lg:px-32 py-2.5 min-w-[280px]">
        <QueryErrorBoundary>
          <Outlet />
        </QueryErrorBoundary>
      </main>
    </div>
  );
};
