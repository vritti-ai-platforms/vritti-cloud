import { OnboardingProvider } from '@context/onboarding';
import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layouts/AdminLayout';
import { AppLayout } from './components/layouts/AppLayout';
import { AuthLayout } from './components/layouts/AuthLayout';
import { OrgLayout } from './components/layouts/OrgLayout';
import { VersionLayout } from './components/layouts/VersionLayout';
import './index.css';
import { AppVersionsPage } from './pages/admin/app-versions/AppVersionsPage';
import { OverviewPage as VersionOverviewPage } from './pages/admin/app-versions/OverviewPage';
import { MicrofrontendsPage } from './pages/admin/app-versions/microfrontends/MicrofrontendsPage';
import { AdminAppsPage } from './pages/admin/app-versions/apps/AdminAppsPage';
import { AppViewPage } from './pages/admin/app-versions/apps/AppViewPage';
import { CloudProvidersPage } from './pages/admin/cloud-providers/CloudProvidersPage';
import { DeploymentsPage } from './pages/admin/deployments/DeploymentsPage';
import { DeploymentViewPage } from './pages/admin/deployments/DeploymentViewPage';
import { FeaturesPage } from './pages/admin/app-versions/features/FeaturesPage';
import { FeatureViewPage } from './pages/admin/app-versions/features/FeatureViewPage';
import { IndustriesPage } from './pages/admin/industries/IndustriesPage';
import { IndustryViewPage } from './pages/admin/industries/IndustryViewPage';
import { OrganizationsPage as AdminOrganizationsPage } from './pages/admin/organizations/OrganizationsPage';
import { OrganizationViewPage as AdminOrganizationViewPage } from './pages/admin/organizations/OrganizationViewPage';
import { PlansPage } from './pages/admin/plans/PlansPage';
import { PlanViewPage } from './pages/admin/plans/PlanViewPage';
import { RegionsPage } from './pages/admin/regions/RegionsPage';
import { RegionViewPage } from './pages/admin/regions/RegionViewPage';
import { AdminRolesPage } from './pages/admin/app-versions/roles/AdminRolesPage';
import { RoleViewPage } from './pages/admin/app-versions/roles/RoleViewPage';
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
import { OrgBusinessUnitsPage } from './pages/cloud/organization/business-units/OrgBusinessUnitsPage';
import { OverviewPage } from './pages/cloud/organization/OverviewPage';
import { PlaceholderPage } from './pages/cloud/organization/PlaceholderPage';
import { CreateOrgRolePage } from './pages/cloud/organization/roles/CreateOrgRolePage';
import { EditOrgRolePage } from './pages/cloud/organization/roles/EditOrgRolePage';
import { OrgRolesPage } from './pages/cloud/organization/roles/OrgRolesPage';
import { UsersPage } from './pages/cloud/organization/UsersPage';
import { CreateOrganizationPage } from './pages/cloud/organizations/CreateOrganizationPage';
import { OrganizationsPage } from './pages/cloud/organizations/OrganizationsPage';
import { OrganizationSettingsPage } from './pages/cloud/organization/settings/OrganizationSettingsPage';
import { ProfilePage } from './pages/cloud/settings/ProfilePage';
import { SecurityPage } from './pages/cloud/settings/SecurityPage';
import { OnboardingPage } from './pages/onboarding/OnboardingPage';

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
];

export const adminRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="app-versions" replace />,
      },
      {
        path: 'app-versions',
        element: <AppVersionsPage />,
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
        path: 'industries/:slug',
        element: <IndustryViewPage />,
      },
      {
        path: 'plans',
        element: <PlansPage />,
      },
      {
        path: 'plans/:slug',
        element: <PlanViewPage />,
      },
      {
        path: 'regions',
        element: <RegionsPage />,
      },
      {
        path: 'regions/:slug',
        element: <RegionViewPage />,
      },
      {
        path: 'deployments',
        element: <DeploymentsPage />,
      },
      {
        path: 'deployments/:slug',
        element: <DeploymentViewPage />,
      },
      {
        path: 'organizations',
        element: <AdminOrganizationsPage />,
      },
      {
        path: 'organizations/:slug',
        element: <AdminOrganizationViewPage />,
      },
    ],
  },
  // Version-scoped routes with their own sidebar layout
  {
    path: '/app-versions/:versionSlug',
    element: <VersionLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="overview" replace />,
      },
      {
        path: 'overview',
        element: <VersionOverviewPage />,
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
        element: <FeatureViewPage />,
      },
      {
        path: 'apps',
        element: <AdminAppsPage />,
      },
      {
        path: 'apps/:slug',
        element: <AppViewPage />,
      },
      {
        path: 'roles',
        element: <AdminRolesPage />,
      },
      {
        path: 'roles/:slug',
        element: <RoleViewPage />,
      },
    ],
  },
  ...accountRoutes,
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
        element: <BUViewPage />,
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
];
