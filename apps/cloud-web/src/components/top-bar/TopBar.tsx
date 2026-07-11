import { useLogo } from '@hooks/useLogo';
import { Breadcrumb } from '@vritti/quantum-ui/Breadcrumb';
import { Button } from '@vritti/quantum-ui/Button';
import { Bell, ChevronRight, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { BusinessSwitcher } from './business-switcher';
import { FeatureSwitcher } from './feature-switcher';
import { OrganizationSwitcher } from './organization-switcher';
import { RoleTemplateSwitcher } from './role-template-switcher';
import { SiteSwitcher } from './site-switcher/SiteSwitcher';
import { UserMenu } from './UserMenu';
import { VersionSwitcher } from './version-switcher';

// Org slugs use the `org-` prefix (e.g., org-healthfirst~uuid)
const ORG_SLUG_PREFIX = 'org-';
// Version slugs use the `ver-` prefix (e.g., ver-restaurant-suite~uuid)
const VERSION_SLUG_PREFIX = 'ver-';
// Site slugs use the `site-` prefix (e.g., site-north-america~uuid)
const SITE_SLUG_PREFIX = 'site-';
// Feature slugs use the `feat-` prefix (e.g., feat-products~uuid)
const FEATURE_SLUG_PREFIX = 'feat-';
// Business slugs use the `biz-` prefix (e.g., biz-pharmacy~uuid)
const BUSINESS_SLUG_PREFIX = 'biz-';
// Role template slugs use the `rt-` prefix (e.g., rt-admin~uuid) — `role-` collides with `role-templates` route
const ROLE_SLUG_PREFIX = 'rt-';

export const TopBar = () => {
  const { pathname } = useLocation();
  const logoImg = useLogo();
  const showBreadcrumb = pathname !== '/';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-sm border-b border-border min-w-70">
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
              maxItems={6}
              renderSegment={(segment) => {
                // First-level segment with org- prefix = org slug
                if (segment.path.match(/^\/[^/]+$/) && segment.raw.startsWith(ORG_SLUG_PREFIX)) {
                  return (
                    <OrganizationSwitcher
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

                // Any segment with site- prefix = site slug (under /:orgSlug/structure/)
                if (segment.raw.startsWith(SITE_SLUG_PREFIX)) {
                  const orgSegment = segment.path.split('/')[1] ?? '';
                  const orgId = orgSegment.split('~').pop() ?? '';
                  return (
                    <SiteSwitcher
                      key={segment.raw}
                      orgId={orgId}
                      orgSlug={orgSegment}
                      currentSiteId={segment.id ?? segment.raw}
                      currentSiteName={segment.slug ? segment.label : undefined}
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

                // Business switcher — under /versions/:versionSlug/businesses/:businessSlug
                if (segment.raw.startsWith(BUSINESS_SLUG_PREFIX)) {
                  const versionSlug = segment.path.split('/')[2] ?? '';
                  return (
                    <BusinessSwitcher
                      key={segment.raw}
                      versionSlug={versionSlug}
                      currentBusinessId={segment.id ?? segment.raw}
                      currentBusinessName={segment.slug ? segment.label : undefined}
                    />
                  );
                }

                // Role template switcher — under /versions/:versionSlug/businesses/:businessSlug/role-templates/:roleTemplateSlug
                if (segment.raw.startsWith(ROLE_SLUG_PREFIX)) {
                  const parts = segment.path.split('/');
                  const versionSlug = parts[2] ?? '';
                  const businessSlug = parts[4] ?? '';
                  return (
                    <RoleTemplateSwitcher
                      key={segment.raw}
                      versionSlug={versionSlug}
                      businessSlug={businessSlug}
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
