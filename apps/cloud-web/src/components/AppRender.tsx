import { useRoutes } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { adminRoutes, cloudRoutes, publicRoutes } from '../routes';

const getSubdomain = (): string => {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];
  return subdomain;
};

const getRoutes = (isAuthenticated: boolean) => {
  const subdomain = getSubdomain();
  if (!isAuthenticated) return publicRoutes;
  switch (subdomain) {
    case 'admin':
      return adminRoutes;
    case 'cloud':
      return cloudRoutes;
    default:
      return cloudRoutes;
  }
};

// Renders auth routes when unauthenticated, app routes when authenticated
export const AppRender: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const routes = getRoutes(isAuthenticated);
  const routeElement = useRoutes(routes);

  if (isLoading) return null;

  return routeElement;
};
