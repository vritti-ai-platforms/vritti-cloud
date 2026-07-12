import { AdminLayout } from '@layouts/AdminLayout';
import { AppLayout } from '@layouts/AppLayout';
import { AuthLayout } from '@layouts/AuthLayout';
import { OrgLayout } from '@layouts/OrgLayout';
import { NotFoundErrorPage } from '@vritti/quantum-ui/ErrorBoundary';
import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Navigate, useNavigate } from 'react-router-dom';
import { VersionScopeProvider } from '@/context/VersionScopeContext';
import { OnboardingProvider } from '@/providers/OnboardingProvider';
import './index.css';
import { ProfilePage } from './pages/account/profile/ProfilePage';
import { SecurityPage } from './pages/account/security/SecurityPage';
import { BillingCyclesPage } from './pages/admin/billing-cycles/BillingCyclesPage';
import { BusinessesPage } from './pages/admin/businesses/BusinessesPage';
import { CloudProvidersPage } from './pages/admin/cloud-providers/CloudProvidersPage';
import { CountriesPage } from './pages/admin/countries/CountriesPage';
import { DeploymentsPage } from './pages/admin/deployments/DeploymentsPage';
import { DeploymentViewPage } from './pages/admin/deployments/DeploymentViewPage';
import { DeploymentViewPageSkeleton } from './pages/admin/deployments/DeploymentViewPageSkeleton';
import { OrganizationViewPage as AdminOrganizationViewPage } from './pages/admin/deployments/organizations/OrganizationViewPage';
import { OrganizationViewPageSkeleton } from './pages/admin/deployments/organizations/OrganizationViewPageSkeleton';
import { RegionsPage } from './pages/admin/regions/RegionsPage';
import { RegionViewPage } from './pages/admin/regions/RegionViewPage';
import { RegionViewPageSkeleton } from './pages/admin/regions/RegionViewPageSkeleton';
import { BusinessDetailPage } from './pages/admin/versions/businesses/BusinessDetailPage';
import { PlanViewPage } from './pages/admin/versions/businesses/tabs/plans/PlanViewPage';
import { PlanViewPageSkeleton } from './pages/admin/versions/businesses/tabs/plans/PlanViewPageSkeleton';
import { RoleTemplateViewPage } from './pages/admin/versions/businesses/tabs/role-templates/RoleTemplateViewPage';
import { RoleTemplateViewPageSkeleton } from './pages/admin/versions/businesses/tabs/role-templates/RoleTemplateViewPageSkeleton';
import { FeatureViewPage } from './pages/admin/versions/tabs/features/FeatureViewPage';
import { FeatureViewPageSkeleton } from './pages/admin/versions/tabs/features/FeatureViewPageSkeleton';
import { VersionDetailPage } from './pages/admin/versions/VersionDetailPage';
import { VersionDetailPageSkeleton } from './pages/admin/versions/VersionDetailPageSkeleton';
import { VersionsPage } from './pages/admin/versions/VersionsPage';
import { AuthErrorPage } from './pages/auth/AuthErrorPage';
import { AuthSuccessPage } from './pages/auth/AuthSuccessPage';
import { ForgotPasswordPage } from './pages/auth/forgot-password';
import { LoginPage } from './pages/auth/LoginPage';
import { MFAVerificationPage } from './pages/auth/MFAVerificationPage';
import { SignupPage } from './pages/auth/SignupPage';
import { HomePage } from './pages/cloud/home/HomePage';
import { InvitationsPage } from './pages/cloud/invitations/InvitationsPage';
import { PlaceholderPage } from './pages/cloud/organization/PlaceholderPage';
import { PlanOverviewPage } from './pages/cloud/organization/plan/PlanOverviewPage';
import { RolesPage } from './pages/cloud/organization/roles/RolesPage';
import { RoleViewPage } from './pages/cloud/organization/roles/RoleViewPage';
import { OrgStructurePage } from './pages/cloud/organization/structure/OrgStructurePage';
import { OrgStructurePageSkeleton } from './pages/cloud/organization/structure/OrgStructurePageSkeleton';
import { SiteViewPageSkeleton } from './pages/cloud/organization/structure/SiteViewPageSkeleton';
import { StructureDetailPage } from './pages/cloud/organization/structure/StructureDetailPage';
import { UsersPage } from './pages/cloud/organization/UsersPage';
import { CreateOrganizationPage } from './pages/cloud/organizations/CreateOrganizationPage';
import { OrganizationsPage } from './pages/cloud/organizations/OrganizationsPage';
import { OnboardingPage } from './pages/onboarding/OnboardingPage';

// Catch-all 404 page using quantum-ui's NotFoundErrorPage
const NotFoundRoute = () => {
  const navigate = useNavigate();
  return <NotFoundErrorPage onGoBack={() => navigate('/', { replace: true })} goBackLabel="Go Home" />;
};

// Shared account routes — rendered under AppLayout (no sidebar) for both admin and cloud
const accountRoutes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'security',
        element: <SecurityPage />,
      },
    ],
  },
];

// Routes shown when the user is not authenticated
export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="login" replace />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
      {
        path: 'auth-success',
        element: <AuthSuccessPage />,
      },
      {
        path: 'auth-error',
        element: <AuthErrorPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'mfa-verify',
        element: <MFAVerificationPage />,
      },
      {
        path: 'onboarding',
        element: (
          <OnboardingProvider>
            <OnboardingPage />
          </OnboardingProvider>
        ),
      },
    ],
  },
  { path: '*', element: <NotFoundRoute /> },
];

export const adminRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="versions" replace />,
      },
      {
        path: 'versions',
        element: <VersionsPage />,
      },
      {
        path: 'cloud-providers',
        element: <CloudProvidersPage />,
      },
      {
        path: 'businesses',
        element: <BusinessesPage />,
      },
      {
        path: 'regions',
        element: <RegionsPage />,
      },
      {
        path: 'regions/:regionSlug',
        element: (
          <Suspense fallback={<RegionViewPageSkeleton />}>
            <RegionViewPage />
          </Suspense>
        ),
      },
      {
        path: 'countries',
        element: <CountriesPage />,
      },
      {
        path: 'billing-cycles',
        element: <BillingCyclesPage />,
      },
      {
        path: 'deployments',
        element: <DeploymentsPage />,
      },
      {
        path: 'deployments/:deploymentSlug',
        element: (
          <Suspense fallback={<DeploymentViewPageSkeleton />}>
            <DeploymentViewPage />
          </Suspense>
        ),
      },
      {
        path: 'deployments/:deploymentSlug/organizations/:orgSlug',
        element: (
          <Suspense fallback={<OrganizationViewPageSkeleton />}>
            <AdminOrganizationViewPage />
          </Suspense>
        ),
      },
    ],
  },
  // Version-scoped tabbed detail pages (no sidebar layout)
  {
    path: '/versions/:versionSlug',
    element: (
      <VersionScopeProvider>
        <AdminLayout />
      </VersionScopeProvider>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="overview" replace />,
      },
      {
        path: ':versionTab',
        element: (
          <Suspense fallback={<VersionDetailPageSkeleton />}>
            <VersionDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'features/:featureSlug',
        element: (
          <Suspense fallback={<FeatureViewPageSkeleton />}>
            <FeatureViewPage />
          </Suspense>
        ),
      },
      {
        path: 'businesses/:businessSlug',
        element: <Navigate to="apps" replace />,
      },
      {
        path: 'businesses/:businessSlug/plans/:planSlug',
        element: (
          <Suspense fallback={<PlanViewPageSkeleton />}>
            <PlanViewPage />
          </Suspense>
        ),
      },
      {
        path: 'businesses/:businessSlug/role-templates/:roleTemplateSlug',
        element: (
          <Suspense fallback={<RoleTemplateViewPageSkeleton />}>
            <RoleTemplateViewPage />
          </Suspense>
        ),
      },
      {
        path: 'businesses/:businessSlug/:businessTab',
        element: <BusinessDetailPage />,
      },
    ],
  },
  ...accountRoutes,
  { path: '*', element: <NotFoundRoute /> },
];

// Routes shown when the user is authenticated
export const cloudRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'my-organizations',
        element: <OrganizationsPage />,
      },
      {
        path: 'new-organization',
        element: <CreateOrganizationPage />,
      },
      {
        path: 'invitations',
        element: <InvitationsPage />,
      },
    ],
  },
  ...accountRoutes,
  {
    path: '/:orgSlug',
    element: <OrgLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="users" replace />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'roles',
        element: <RolesPage />,
      },
      {
        path: 'roles/:roleSlug',
        element: <RoleViewPage />,
      },
      {
        path: 'structure',
        element: (
          <Suspense fallback={<OrgStructurePageSkeleton />}>
            <OrgStructurePage />
          </Suspense>
        ),
      },
      {
        path: 'structure/:structureSlug',
        element: (
          <Suspense fallback={<SiteViewPageSkeleton />}>
            <StructureDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'plan',
        element: <PlanOverviewPage />,
      },
      {
        path: 'billing',
        element: <PlaceholderPage />,
      },
      {
        path: 'settings',
        element: <Navigate to="../structure" replace />,
      },
    ],
  },
  { path: '*', element: <NotFoundRoute /> },
];
