import { AdminLayout } from '@layouts/AdminLayout';
import { AppLayout } from '@layouts/AppLayout';
import { AuthLayout } from '@layouts/AuthLayout';
import { OrgLayout } from '@layouts/OrgLayout';
import { VersionLayout } from '@layouts/VersionLayout';
import { NotFoundErrorPage } from '@vritti/quantum-ui/ErrorBoundary';
import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Navigate, useNavigate } from 'react-router-dom';
import { OnboardingProvider } from '@/providers/OnboardingProvider';
import './index.css';
import { ProfilePage } from './pages/account/profile/ProfilePage';
import { SecurityPage } from './pages/account/SecurityPage';
import { CloudProvidersPage } from './pages/admin/cloud-providers/CloudProvidersPage';
import { DeploymentsPage } from './pages/admin/deployments/DeploymentsPage';
import { DeploymentViewPage } from './pages/admin/deployments/DeploymentViewPage';
import { DeploymentViewPageSkeleton } from './pages/admin/deployments/DeploymentViewPageSkeleton';
import { IndustriesPage } from './pages/admin/industries/IndustriesPage';
import { OrganizationsPage as AdminOrganizationsPage } from './pages/admin/organizations/OrganizationsPage';
import { OrganizationViewPage as AdminOrganizationViewPage } from './pages/admin/organizations/OrganizationViewPage';
import { OrganizationViewPageSkeleton } from './pages/admin/organizations/OrganizationViewPageSkeleton';
import { PlansPage } from './pages/admin/plans/PlansPage';
import { PlanViewPage } from './pages/admin/plans/PlanViewPage';
import { PlanViewPageSkeleton } from './pages/admin/plans/PlanViewPageSkeleton';
import { RegionsPage } from './pages/admin/regions/RegionsPage';
import { RegionViewPage } from './pages/admin/regions/RegionViewPage';
import { RegionViewPageSkeleton } from './pages/admin/regions/RegionViewPageSkeleton';
import { AdminAppsPage } from './pages/admin/versions/apps/AdminAppsPage';
import { AppViewPage } from './pages/admin/versions/apps/AppViewPage';
import { AppViewPageSkeleton } from './pages/admin/versions/apps/AppViewPageSkeleton';
import { FeaturesPage } from './pages/admin/versions/features/FeaturesPage';
import { FeatureViewPage } from './pages/admin/versions/features/FeatureViewPage';
import { FeatureViewPageSkeleton } from './pages/admin/versions/features/FeatureViewPageSkeleton';
import { MicrofrontendsPage } from './pages/admin/versions/microfrontends/MicrofrontendsPage';
import { OverviewPage as VersionOverviewPage } from './pages/admin/versions/overview/OverviewPage';
import { OverviewPageSkeleton as VersionOverviewPageSkeleton } from './pages/admin/versions/overview/OverviewPageSkeleton';
import { AdminRolesPage } from './pages/admin/versions/roles/AdminRolesPage';
import { RoleViewPage } from './pages/admin/versions/roles/RoleViewPage';
import { RoleViewPageSkeleton } from './pages/admin/versions/roles/RoleViewPageSkeleton';
import { VersionsPage } from './pages/admin/versions/VersionsPage';
import { AuthErrorPage } from './pages/auth/AuthErrorPage';
import { AuthSuccessPage } from './pages/auth/AuthSuccessPage';
import { ForgotPasswordPage } from './pages/auth/forgot-password';
import { LoginPage } from './pages/auth/LoginPage';
import { MFAVerificationPage } from './pages/auth/MFAVerificationPage';
import { SignupPage } from './pages/auth/SignupPage';
import { HomePage } from './pages/cloud/home/HomePage';
import { InvitationsPage } from './pages/cloud/invitations/InvitationsPage';
import { OrgAppsPage } from './pages/cloud/organization/apps/OrgAppsPage';
import { BUViewPage } from './pages/cloud/organization/business-units/BUViewPage';
import { BUViewPageSkeleton } from './pages/cloud/organization/business-units/BUViewPageSkeleton';
import { OrgBusinessUnitsPage } from './pages/cloud/organization/business-units/OrgBusinessUnitsPage';
import { OverviewPage } from './pages/cloud/organization/OverviewPage';
import { PlaceholderPage } from './pages/cloud/organization/PlaceholderPage';
import { CreateOrgRolePage } from './pages/cloud/organization/roles/CreateOrgRolePage';
import { EditOrgRolePage } from './pages/cloud/organization/roles/EditOrgRolePage';
import { OrgRolesPage } from './pages/cloud/organization/roles/OrgRolesPage';
import { OrganizationSettingsPage } from './pages/cloud/organization/settings/OrganizationSettingsPage';
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
        path: 'industries',
        element: <IndustriesPage />,
      },
      {
        path: 'plans',
        element: <PlansPage />,
      },
      {
        path: 'plans/:slug',
        element: (
          <Suspense fallback={<PlanViewPageSkeleton />}>
            <PlanViewPage />
          </Suspense>
        ),
      },
      {
        path: 'regions',
        element: <RegionsPage />,
      },
      {
        path: 'regions/:slug',
        element: (
          <Suspense fallback={<RegionViewPageSkeleton />}>
            <RegionViewPage />
          </Suspense>
        ),
      },
      {
        path: 'deployments',
        element: <DeploymentsPage />,
      },
      {
        path: 'deployments/:slug',
        element: (
          <Suspense fallback={<DeploymentViewPageSkeleton />}>
            <DeploymentViewPage />
          </Suspense>
        ),
      },
      {
        path: 'organizations',
        element: <AdminOrganizationsPage />,
      },
      {
        path: 'organizations/:slug',
        element: (
          <Suspense fallback={<OrganizationViewPageSkeleton />}>
            <AdminOrganizationViewPage />
          </Suspense>
        ),
      },
    ],
  },
  // Version-scoped routes with their own sidebar layout
  {
    path: '/versions/:slug',
    element: <VersionLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="overview" replace />,
      },
      {
        path: 'overview',
        element: (
          <Suspense fallback={<VersionOverviewPageSkeleton />}>
            <VersionOverviewPage />
          </Suspense>
        ),
      },
      {
        path: 'microfrontends',
        element: <MicrofrontendsPage />,
      },
      {
        path: 'features',
        element: <FeaturesPage />,
      },
      {
        path: 'features/:slug',
        element: (
          <Suspense fallback={<FeatureViewPageSkeleton />}>
            <FeatureViewPage />
          </Suspense>
        ),
      },
      {
        path: 'apps',
        element: <AdminAppsPage />,
      },
      {
        path: 'apps/:slug',
        element: (
          <Suspense fallback={<AppViewPageSkeleton />}>
            <AppViewPage />
          </Suspense>
        ),
      },
      {
        path: 'roles',
        element: <AdminRolesPage />,
      },
      {
        path: 'roles/:slug',
        element: (
          <Suspense fallback={<RoleViewPageSkeleton />}>
            <RoleViewPage />
          </Suspense>
        ),
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
        element: <Navigate to="overview" replace />,
      },
      {
        path: 'overview',
        element: <OverviewPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'roles',
        element: <OrgRolesPage />,
      },
      {
        path: 'roles/create',
        element: <CreateOrgRolePage />,
      },
      {
        path: 'roles/:roleId/edit',
        element: <EditOrgRolePage />,
      },
      {
        path: 'business-units',
        element: <OrgBusinessUnitsPage />,
      },
      {
        path: 'business-units/:buSlug',
        element: (
          <Suspense fallback={<BUViewPageSkeleton />}>
            <BUViewPage />
          </Suspense>
        ),
      },
      {
        path: 'applications',
        element: <OrgAppsPage />,
      },
      {
        path: 'billing',
        element: <PlaceholderPage />,
      },
      {
        path: 'settings',
        element: <OrganizationSettingsPage />,
      },
    ],
  },
  { path: '*', element: <NotFoundRoute /> },
];
