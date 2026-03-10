import { OnboardingProvider } from '@context/onboarding';
import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layouts/AdminLayout';
import { AppLayout } from './components/layouts/AppLayout';
import { AuthLayout } from './components/layouts/AuthLayout';
import { OrgLayout } from './components/layouts/OrgLayout';
import './index.css';
import { CloudProvidersPage } from './pages/admin/cloud-providers/CloudProvidersPage';
import { DeploymentsPage } from './pages/admin/deployments/DeploymentsPage';
import { DeploymentViewPage } from './pages/admin/deployments/DeploymentViewPage';
import { IndustriesPage } from './pages/admin/industries/IndustriesPage';
import { PlansPage } from './pages/admin/plans/PlansPage';
import { PlanViewPage } from './pages/admin/plans/PlanViewPage';
import { RegionsPage } from './pages/admin/regions/RegionsPage';
import { RegionViewPage } from './pages/admin/regions/RegionViewPage';
import { AuthErrorPage } from './pages/auth/AuthErrorPage';
import { AuthSuccessPage } from './pages/auth/AuthSuccessPage';
import { ForgotPasswordPage } from './pages/auth/forgot-password';
import { LoginPage } from './pages/auth/LoginPage';
import { MFAVerificationPage } from './pages/auth/MFAVerificationPage';
import { SignupPage } from './pages/auth/SignupPage';
import { HomePage } from './pages/cloud/home/HomePage';
import { InvitationsPage } from './pages/cloud/invitations/InvitationsPage';
import { OverviewPage } from './pages/cloud/organization/OverviewPage';
import { PlaceholderPage } from './pages/cloud/organization/PlaceholderPage';
import { CreateOrganizationPage } from './pages/cloud/organizations/CreateOrganizationPage';
import { OrganizationsPage } from './pages/cloud/organizations/OrganizationsPage';
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
        element: <Navigate to="cloud-providers" replace />,
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
        element: <PlaceholderPage />,
      },
      {
        path: 'roles',
        element: <PlaceholderPage />,
      },
      {
        path: 'business-units',
        element: <PlaceholderPage />,
      },
      {
        path: 'applications',
        element: <PlaceholderPage />,
      },
      {
        path: 'billing',
        element: <PlaceholderPage />,
      },
      {
        path: 'settings',
        element: <PlaceholderPage />,
      },
    ],
  },
];
