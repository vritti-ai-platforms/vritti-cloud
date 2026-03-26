import { axios } from '@vritti/quantum-ui/axios';
import type { PhoneValue } from '@vritti/quantum-ui/PhoneField';
import type { ChangePasswordDto, ProfileData, Session, UpdateProfileDto } from '@/schemas/cloud/settings';
import { AccountStatus } from '@/schemas/cloud/settings';

interface AuthStatusResponse {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    fullName: string;
    displayName: string;
    phone: PhoneValue;
    phoneCountry: string;
    accountStatus: string;
    locale: string;
    timezone: string;
    createdAt: string;
    lastLoginAt: string | null;
    profilePictureUrl: string | null;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    onboardingStep?: string;
    hasPassword?: boolean;
  };
  accessToken?: string;
  expiresIn?: number;
}

// Maps backend AccountStatus enum to frontend enum
function mapAccountStatus(backendStatus: string): AccountStatus {
  switch (backendStatus) {
    case 'PENDING_VERIFICATION':
      return AccountStatus.PENDING;
    case 'ACTIVE':
      return AccountStatus.ACTIVE;
    case 'INACTIVE':
      return AccountStatus.DEACTIVATED;
    default:
      return AccountStatus.PENDING;
  }
}

// Gets the current user profile
export function getProfile(): Promise<ProfileData> {
  return axios.get<AuthStatusResponse>('auth/status', { showSuccessToast: false }).then((r) => {
    if (!r.data.isAuthenticated || !r.data.user) {
      throw new Error('User is not authenticated');
    }
    const user = r.data.user;
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      displayName: user.displayName,
      phone: user.phone as PhoneValue,
      phoneCountry: user.phoneCountry,
      accountStatus: mapAccountStatus(user.accountStatus),
      locale: user.locale,
      timezone: user.timezone,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      profilePictureUrl: user.profilePictureUrl,
    };
  });
}

// Updates the user profile
export function updateProfile(data: UpdateProfileDto): Promise<ProfileData> {
  return axios
    .put<ProfileData>('settings/profile', data, {
      loadingMessage: 'Updating profile...',
      successMessage: 'Profile updated successfully',
    })
    .then((r) => r.data);
}

// Changes the user password
export function changePassword(data: ChangePasswordDto): Promise<void> {
  return axios
    .post('auth/password/change', data, {
      loadingMessage: 'Changing password...',
      successMessage: 'Password changed successfully',
    })
    .then(() => undefined);
}

// Gets the list of active sessions
export function getSessions(): Promise<Session[]> {
  return axios.get<Session[]>('auth/sessions', { showSuccessToast: false }).then((r) => r.data);
}

// Revokes a specific session
export function revokeSession(sessionId: string): Promise<void> {
  return axios
    .delete(`auth/sessions/${sessionId}`, {
      loadingMessage: 'Revoking session...',
      successMessage: 'Session revoked successfully',
    })
    .then(() => undefined);
}

// Revokes all sessions except the current one
export function revokeAllOtherSessions(): Promise<void> {
  return axios
    .post('auth/logout-all', null, {
      loadingMessage: 'Signing out all devices...',
      successMessage: 'Signed out from all other devices',
    })
    .then(() => undefined);
}

// Permanently deletes the user account
export function deleteAccount(): Promise<void> {
  return axios
    .delete('settings/account', {
      loadingMessage: 'Deleting account...',
      successMessage: 'Account deleted successfully',
    })
    .then(() => undefined);
}
