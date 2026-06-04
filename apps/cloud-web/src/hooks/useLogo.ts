import { useTheme } from '@vritti/quantum-ui/hooks';

import adminDark from '../assets/vritti_admin_dark.svg';
import adminLight from '../assets/vritti_admin_light.svg';
import cloudDark from '../assets/vritti_cloud_dark.svg';
import cloudLight from '../assets/vritti_cloud_light.svg';

// Returns the correct logo SVG based on subdomain and theme
export function useLogo(): string {
  const { theme } = useTheme();
  const subdomain = window.location.hostname.split('.')[0];
  const isDark = theme === 'dark';

  if (subdomain === 'admin') {
    return isDark ? adminDark : adminLight;
  }
  return isDark ? cloudDark : cloudLight;
}
