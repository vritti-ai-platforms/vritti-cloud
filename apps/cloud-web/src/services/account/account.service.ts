import { axios } from '@vritti/quantum-ui/axios';
import type { ChangePasswordDto, ProfileData, Session, UpdateProfileDto } from '@/schemas/cloud/account';

// Gets the current user profile
export function getProfile(): Promise<ProfileData> {
  return axios.get<ProfileData>('account/profile', { showSuccessToast: false }).then((r) => r.data);
}

// Updates the user profile
export function updateProfile(data: UpdateProfileDto): Promise<ProfileData> {
  return axios
    .put<ProfileData>('account/profile', data, {
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
    .delete('account/delete', {
      loadingMessage: 'Deleting account...',
      successMessage: 'Account deleted successfully',
    })
    .then(() => undefined);
}
