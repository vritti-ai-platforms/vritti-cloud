import { Breadcrumb } from '@vritti/quantum-ui/Breadcrumb';
import { Button } from '@vritti/quantum-ui/Button';
import { Bell, ChevronRight, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLogo } from '@hooks/useLogo';
import { AppSwitcher } from './app-switcher';
import { BUSwitcher } from './bu-switcher/BUSwitcher';
import { CompanySwitcher } from './company-switcher';
import { FeatureSwitcher } from './feature-switcher';
import { RoleSwitcher } from './role-switcher';
import { VersionSwitcher } from './version-switcher';
import { UserMenu } from './UserMenu';

// Org slugs use the `org-` prefix (e.g., org-healthfirst~uuid)
const ORG_SLUG_PREFIX = 'org-';
// Version slugs use the `ver-` prefix (e.g., ver-restaurant-suite~uuid)
const VERSION_SLUG_PREFIX = 'ver-';
// BU slugs use the `bu-` prefix (e.g., bu-north-america~uuid)
const BU_SLUG_PREFIX = 'bu-';
// App slugs use the `app-` prefix (e.g., app-catalog-management~uuid)
const APP_SLUG_PREFIX = 'app-';
// Feature slugs use the `feat-` prefix (e.g., feat-products~uuid)
const FEATURE_SLUG_PREFIX = 'feat-';
// Role slugs use the `role-` prefix (e.g., role-admin~uuid)
const ROLE_SLUG_PREFIX = 'role-';

export const TopBar = () => {
  const { pathname } = useLocation();
  const logoImg = useLogo();
  const showBreadcrumb = pathname !== '/';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-sm border-b border-border min-w-[280px]">
      <div className="h-14 px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src={logoImg} alt="Vritti Logo" className="h-7 w-auto" />
        </Link>

        {showBreadcrumb && <ChevronRight className="size-4 text-muted-foreground shrink-0 mx-2" />}

        {/* Breadcrumb */}
        <div className="flex-1">
          {showBreadcrumb && (
            <Breadcrumb
              maxItems={4}
              renderSegment={(segment) => {
                // First-level segment with org- prefix = org slug
                if (segment.path.match(/^\/[^/]+$/) && segment.raw.startsWith(ORG_SLUG_PREFIX)) {
                  return (
                    <CompanySwitcher
                      currentOrgId={segment.id ?? segment.raw}
                      currentOrgName={segment.slug ? segment.label : undefined}
                    />
                  );
                }

                // Any segment with ver- prefix = version slug (under /versions/)
                if (segment.raw.startsWith(VERSION_SLUG_PREFIX)) {
                  return (
                    <VersionSwitcher
                      key={segment.raw}
                      currentVersionId={segment.id ?? segment.raw}
                      currentVersionName={segment.slug ? segment.label : undefined}
                    />
                  );
                }

                // Any segment with bu- prefix = BU slug (under /:orgSlug/business-units/)
                if (segment.raw.startsWith(BU_SLUG_PREFIX)) {
                  const orgSegment = segment.path.split('/')[1] ?? '';
                  const orgId = orgSegment.split('~').pop() ?? '';
                  return (
                    <BUSwitcher
                      key={segment.raw}
                      orgId={orgId}
                      orgSlug={orgSegment}
                      currentBuId={segment.id ?? segment.raw}
                      currentBuName={segment.slug ? segment.label : undefined}
                    />
                  );
                }

                // App switcher — under /versions/:versionSlug/apps/:appSlug
                if (segment.raw.startsWith(APP_SLUG_PREFIX)) {
                  const versionSlug = segment.path.split('/')[2] ?? '';
                  return (
                    <AppSwitcher
                      key={segment.raw}
                      versionSlug={versionSlug}
                      currentAppId={segment.id ?? segment.raw}
                      currentAppName={segment.slug ? segment.label : undefined}
                    />
                  );
                }

                // Feature switcher — under /versions/:versionSlug/features/:featureSlug
                if (segment.raw.startsWith(FEATURE_SLUG_PREFIX)) {
                  const versionSlug = segment.path.split('/')[2] ?? '';
                  return (
                    <FeatureSwitcher
                      key={segment.raw}
                      versionSlug={versionSlug}
                      currentFeatureId={segment.id ?? segment.raw}
                      currentFeatureName={segment.slug ? segment.label : undefined}
                    />
                  );
                }

                // Role switcher — under /versions/:versionSlug/roles/:roleSlug
                if (segment.raw.startsWith(ROLE_SLUG_PREFIX)) {
                  const versionSlug = segment.path.split('/')[2] ?? '';
                  return (
                    <RoleSwitcher
                      key={segment.raw}
                      versionSlug={versionSlug}
                      currentRoleId={segment.id ?? segment.raw}
                      currentRoleName={segment.slug ? segment.label : undefined}
                    />
                  );
                }

                return undefined;
              }}
            />
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>

          {/* Ask Vritti Button */}
          <Button variant="ghost" size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Ask Vritti</span>
          </Button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </div>
  );
};
