import { useOutletContext } from 'react-router-dom';

interface VersionContext {
  versionId: string;
}

// Reads the versionId from VersionLayout's Outlet context
export function useVersionContext(): VersionContext {
  return useOutletContext<VersionContext>();
}
