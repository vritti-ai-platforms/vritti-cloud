import { useSlugParams } from '@vritti/quantum-ui/hooks';
import { createContext, useContext, useMemo } from 'react';

export interface VersionScope {
  versionId: string;
  businessId: string;
  planId: string;
  featureId: string;
  roleTemplateId: string;
}

const VersionScopeContext = createContext<VersionScope | null>(null);

// Provides the version/business/plan ids resolved from the active route's slug params (missing levels resolve to '').
export const VersionScopeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { id: versionId } = useSlugParams('versionSlug');
  const { id: businessId } = useSlugParams('businessSlug');
  const { id: planId } = useSlugParams('planSlug');
  const { id: featureId } = useSlugParams('featureSlug');
  const { id: roleTemplateId } = useSlugParams('roleTemplateSlug');

  const value = useMemo<VersionScope>(
    () => ({
      versionId: versionId ?? '',
      businessId: businessId ?? '',
      planId: planId ?? '',
      featureId: featureId ?? '',
      roleTemplateId: roleTemplateId ?? '',
    }),
    [versionId, businessId, planId, featureId, roleTemplateId],
  );

  return <VersionScopeContext.Provider value={value}>{children}</VersionScopeContext.Provider>;
};

// Reads the current version scope; throws if used outside VersionScopeProvider
export function useVersionContext(): VersionScope {
  const ctx = useContext(VersionScopeContext);
  if (!ctx) {
    throw new Error('useVersionContext must be used within a VersionScopeProvider');
  }
  return ctx;
}
