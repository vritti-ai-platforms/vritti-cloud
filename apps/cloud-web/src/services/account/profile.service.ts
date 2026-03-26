import { axios } from '@vritti/quantum-ui/axios';
import type { ChangePasswordDto, ProfileData, Session, UpdateProfileDto } from '@/schemas/cloud/account';

export interface SuccessResponse {
  success: boolean;
  message: string;
}

export const CHANNELS = {
  IDENTITY_EMAIL: 'IDENTITY_EMAIL_OUT',
  IDENTITY_PHONE: 'IDENTITY_SMS_OUT',
  EMAIL: 'EMAIL',
  PHONE: 'SMS_OUT',
} as const;

// Profile CRUD

export function getProfile(): Promise<ProfileData> {
  return axios.get<ProfileData>('account/profile', { showSuccessToast: false }).then((r) => r.data);
}

export function updateProfile(data: UpdateProfileDto): Promise<ProfileData> {
  return axios
    .put<ProfileData>('account/profile', data, {
      loadingMessage: 'Updating profile...',
      successMessage: 'Profile updated successfully',
    })
    .then((r) => r.data);
}

export function deleteAccount(): Promise<void> {
  return axios
    .delete('account/delete', {
      loadingMessage: 'Deleting account...',
      successMessage: 'Account deleted successfully',
    })
    .then(() => undefined);
}

// Security

export function changePassword(data: ChangePasswordDto): Promise<void> {
  return axios
    .post('auth/password/change', data, {
      loadingMessage: 'Changing password...',
      successMessage: 'Password changed successfully',
    })
    .then(() => undefined);
}

export function getSessions(): Promise<Session[]> {
  return axios.get<Session[]>('auth/sessions', { showSuccessToast: false }).then((r) => r.data);
}

export function revokeSession(sessionId: string): Promise<void> {
  return axios
    .delete(`auth/sessions/${sessionId}`, {
      loadingMessage: 'Revoking session...',
      successMessage: 'Session revoked successfully',
    })
    .then(() => undefined);
}

export function revokeAllOtherSessions(): Promise<void> {
  return axios
    .post('auth/logout-all', null, {
      loadingMessage: 'Signing out all devices...',
      successMessage: 'Signed out from all other devices',
    })
    .then(() => undefined);
}

// Contact change

export function identityVerificationStart(channel: string): Promise<{ expiresAt: string }> {
  return axios
    .post<{ expiresAt: string }>('account/profile/identity-verification-start', { channel })
    .then((r) => r.data);
}

export function verifyIdentity(data: { channel: string; otpCode: string }): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>('account/profile/verify-identity', data).then((r) => r.data);
}

export function submitNewTarget(data: { channel: string; target: string }): Promise<{ expiresAt: string }> {
  return axios.post<{ expiresAt: string }>('account/profile/submit-new-target', data).then((r) => r.data);
}

export function verifyNewTarget(data: { channel: string; otpCode: string }): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>('account/profile/verify-new-target', data).then((r) => r.data);
}

export function resendTargetOtp(channel: string): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>('account/profile/resend-target-otp', { channel }).then((r) => r.data);
}
