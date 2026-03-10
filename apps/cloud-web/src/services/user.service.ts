import axios from '@vritti/quantum-ui/axios';

export interface User {
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  accountStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  onboardingStep: 'EMAIL_VERIFICATION' | 'PASSWORD_SETUP' | 'PHONE_VERIFICATION' | 'TWO_FACTOR_SETUP' | 'COMPLETE';
  hasPassword: boolean;
  signupMethod: 'email' | 'oauth';
  phone?: string | null;
  phoneCountry?: string | null;
  profilePictureUrl?: string | null;
  locale: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
}

export interface AuthStatusResponse {
  isAuthenticated: boolean;
  user?: User;
  accessToken?: string;
  expiresIn?: number;
}

// Fetches the current user's authentication status
export function getAuthStatus(): Promise<AuthStatusResponse> {
  return axios.get<AuthStatusResponse>('cloud-api/auth/status', { public: true }).then((r) => r.data);
}

// Logs out the current user from the current device
export function logout(): Promise<void> {
  return axios.post('cloud-api/auth/logout', {}, { successMessage: 'Logged out successfully' }).then(() => undefined);
}

// Logs out the current user from all devices
export function logoutAll(): Promise<void> {
  return axios
    .post('cloud-api/auth/logout-all', {}, { successMessage: 'Logged out from all devices' })
    .then(() => undefined);
}
