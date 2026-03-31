import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/browser';
import { axios } from '@vritti/quantum-ui/axios';
import type { SuccessResponse } from './profile.service';

export interface SessionData {
  sessionId: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export function changePassword(data: { currentPassword: string; newPassword: string }): Promise<SuccessResponse> {
  return axios
    .post<SuccessResponse>('account/security/change-password', data, {
      loadingMessage: 'Changing password...',
      successMessage: 'Password changed successfully',
    })
    .then((r) => r.data);
}

export function getSessions(): Promise<SessionData[]> {
  return axios.get<SessionData[]>('account/security/sessions', { showSuccessToast: false }).then((r) => r.data);
}

export function revokeSession(sessionId: string): Promise<SuccessResponse> {
  return axios
    .delete<SuccessResponse>(`account/security/sessions/${sessionId}`, {
      loadingMessage: 'Revoking session...',
      successMessage: 'Session revoked successfully',
    })
    .then((r) => r.data);
}

export function revokeAllSessions(): Promise<SuccessResponse> {
  return axios
    .post<SuccessResponse>('account/security/sessions/revoke-all', null, {
      loadingMessage: 'Signing out all devices...',
      successMessage: 'Signed out from all other devices',
    })
    .then((r) => r.data);
}

// MFA Types

export interface MfaStatusData {
  isEnabled: boolean;
  methods: ('TOTP' | 'PASSKEY')[];
  backupCodesRemaining: number;
  passkeys: PasskeyData[];
  lastUsedAt: string | null;
}

export interface TotpSetupData {
  keyUri: string;
  manualSetupKey: string;
  issuer: string;
  accountName: string;
}

export interface PasskeyData {
  id: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface BackupCodesResponse {
  success: boolean;
  backupCodes: string[];
  warning?: string;
}

// MFA Status

export function getMfaStatus(): Promise<MfaStatusData> {
  return axios.get<MfaStatusData>('account/security/mfa/status', { showSuccessToast: false }).then((r) => r.data);
}

// TOTP

export function initiateTotpSetup(): Promise<TotpSetupData> {
  return axios
    .post<TotpSetupData>('account/security/mfa/totp/setup', null, { showSuccessToast: false })
    .then((r) => r.data);
}

export function verifyTotpSetup(data: { code: string }): Promise<BackupCodesResponse> {
  return axios
    .post<BackupCodesResponse>('account/security/mfa/totp/verify-setup', data, { showSuccessToast: false })
    .then((r) => r.data);
}

export function disableTotp(): Promise<SuccessResponse> {
  return axios
    .delete<SuccessResponse>('account/security/mfa/totp', {
      loadingMessage: 'Disabling authenticator app...',
      successMessage: 'Authenticator app disabled',
    })
    .then((r) => r.data);
}

export function disableAllMfa(): Promise<SuccessResponse> {
  return axios
    .delete<SuccessResponse>('account/security/mfa', {
      loadingMessage: 'Disabling all two-factor authentication...',
      successMessage: 'All two-factor authentication disabled',
    })
    .then((r) => r.data);
}

// Passkey

export function getPasskeySetupOptions(): Promise<PublicKeyCredentialCreationOptionsJSON> {
  return axios
    .post<PublicKeyCredentialCreationOptionsJSON>('account/security/mfa/passkey/setup-options', null, {
      showSuccessToast: false,
    })
    .then((r) => r.data);
}

export function verifyPasskeySetup(data: { credential: any }): Promise<BackupCodesResponse> {
  return axios
    .post<BackupCodesResponse>('account/security/mfa/passkey/verify-setup', data, { showSuccessToast: false })
    .then((r) => r.data);
}

export function listPasskeys(): Promise<PasskeyData[]> {
  return axios.get<PasskeyData[]>('account/security/mfa/passkeys', { showSuccessToast: false }).then((r) => r.data);
}

export function removePasskey(passkeyId: string): Promise<SuccessResponse> {
  return axios
    .delete<SuccessResponse>(`account/security/mfa/passkey/${passkeyId}`, {
      loadingMessage: 'Removing passkey...',
      successMessage: 'Passkey removed successfully',
    })
    .then((r) => r.data);
}

// Backup Codes

export function regenerateBackupCodes(): Promise<BackupCodesResponse> {
  return axios
    .post<BackupCodesResponse>('account/security/mfa/backup-codes/regenerate', null, {
      successMessage: 'Backup codes regenerated',
    })
    .then((r) => r.data);
}
