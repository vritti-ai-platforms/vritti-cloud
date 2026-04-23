import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { SessionResponse } from '../../../cloud-api/auth/root/dto/entity/session-response.dto';
import { LinkedAccountsResponseDto } from '../dto/response/linked-account-response.dto';
import { ChangePasswordDto } from '../dto/request/change-password.dto';
import { VerifyPasskeySetupDto } from '../dto/request/verify-passkey-setup.dto';
import { VerifyTotpSetupDto } from '../dto/request/verify-totp-setup.dto';
import { BackupCodesResponseDto } from '../dto/response/backup-codes-response.dto';
import { MfaStatusResponseDto, PasskeyInfoDto } from '../dto/response/mfa-status-response.dto';
import { TotpSetupResponseDto } from '../dto/response/totp-setup-response.dto';

export function ApiChangePassword() {
  return applyDecorators(
    ApiOperation({
      summary: 'Change password',
      description: "Change the authenticated user's password. Requires current password verification.",
    }),
    ApiBody({ type: ChangePasswordDto }),
    ApiResponse({ status: 200, description: 'Password changed successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Invalid current password or new password matches current.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiGetSessions() {
  return applyDecorators(
    ApiOperation({
      summary: 'List active sessions',
      description: 'Get all active sessions for the authenticated user across all devices.',
    }),
    ApiResponse({ status: 200, description: 'Active sessions retrieved.', type: [SessionResponse] }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiRevokeSession() {
  return applyDecorators(
    ApiOperation({
      summary: 'Revoke a specific session',
      description: 'Invalidate a specific session by ID. Cannot revoke the current session.',
    }),
    ApiParam({ name: 'id', description: 'Session ID to revoke' }),
    ApiResponse({ status: 200, description: 'Session revoked.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Cannot revoke current session.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Session not found.' }),
  );
}

export function ApiRevokeAllSessions() {
  return applyDecorators(
    ApiOperation({
      summary: 'Revoke all other sessions',
      description: 'Invalidate all active sessions for the current user except the current one.',
    }),
    ApiResponse({ status: 200, description: 'All other sessions revoked.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiGetMfaStatus() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get MFA status',
      description: 'Returns the current multi-factor authentication status including method, backup codes remaining, and registered passkeys.',
    }),
    ApiResponse({ status: 200, description: 'MFA status retrieved.', type: MfaStatusResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiSetupTotp() {
  return applyDecorators(
    ApiOperation({
      summary: 'Initiate TOTP setup',
      description: 'Generates a TOTP secret and returns the QR code URI for the authenticator app. Deletes any previous pending setup.',
    }),
    ApiResponse({ status: 200, description: 'TOTP setup initiated.', type: TotpSetupResponseDto }),
    ApiResponse({ status: 400, description: 'MFA is already enabled.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiVerifyTotpSetup() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verify TOTP setup',
      description: 'Validates the 6-digit TOTP code against the pending setup and activates MFA. Returns backup codes.',
    }),
    ApiBody({ type: VerifyTotpSetupDto }),
    ApiResponse({ status: 200, description: 'TOTP verified and MFA enabled.', type: BackupCodesResponseDto }),
    ApiResponse({ status: 400, description: 'Invalid TOTP code.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'No pending TOTP setup found.' }),
  );
}

export function ApiDisableTotp() {
  return applyDecorators(
    ApiOperation({
      summary: 'Disable TOTP',
      description: 'Deactivates TOTP-based multi-factor authentication for the user.',
    }),
    ApiResponse({ status: 200, description: 'TOTP disabled.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Authenticator app not enabled.' }),
  );
}

export function ApiDisableAllMfa() {
  return applyDecorators(
    ApiOperation({
      summary: 'Disable all MFA methods',
      description: 'Deactivates all multi-factor authentication methods for the user.',
    }),
    ApiResponse({ status: 200, description: 'All MFA methods disabled.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'No active MFA found.' }),
  );
}

export function ApiGetPasskeySetupOptions() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get passkey setup options',
      description: 'Generates WebAuthn registration options for passkey setup. Returns PublicKeyCredentialCreationOptions.',
    }),
    ApiResponse({ status: 200, description: 'Passkey registration options generated.' }),
    ApiResponse({ status: 400, description: 'MFA is already enabled with a different method.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiVerifyPasskeySetup() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verify passkey setup',
      description: 'Verifies the WebAuthn registration response and activates passkey-based MFA. Returns backup codes.',
    }),
    ApiBody({ type: VerifyPasskeySetupDto }),
    ApiResponse({ status: 200, description: 'Passkey verified and MFA enabled.', type: BackupCodesResponseDto }),
    ApiResponse({ status: 400, description: 'Passkey verification failed.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'No pending passkey setup found.' }),
  );
}

export function ApiListPasskeys() {
  return applyDecorators(
    ApiOperation({
      summary: 'List registered passkeys',
      description: 'Returns all active passkeys registered for the authenticated user.',
    }),
    ApiResponse({ status: 200, description: 'Passkeys retrieved.', type: [PasskeyInfoDto] }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiRemovePasskey() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove a passkey',
      description: 'Deactivates a specific passkey by its MFA record ID.',
    }),
    ApiParam({ name: 'id', description: 'MFA record ID of the passkey to remove' }),
    ApiResponse({ status: 200, description: 'Passkey removed.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Passkey not found.' }),
  );
}

export function ApiRegenerateBackupCodes() {
  return applyDecorators(
    ApiOperation({
      summary: 'Regenerate backup codes',
      description: 'Generates a new set of backup codes, invalidating all previous codes.',
    }),
    ApiResponse({ status: 200, description: 'Backup codes regenerated.', type: BackupCodesResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'No active MFA found.' }),
  );
}

export function ApiGetLinkedAccounts() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get linked OAuth accounts',
      description: 'Returns all linked OAuth providers and whether the user can disconnect any.',
    }),
    ApiResponse({ status: 200, description: 'Linked accounts retrieved.', type: LinkedAccountsResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiDisconnectProvider() {
  return applyDecorators(
    ApiOperation({
      summary: 'Disconnect OAuth provider',
      description: 'Removes a linked OAuth provider. Requires the user to have a password or another linked provider.',
    }),
    ApiParam({ name: 'provider', description: 'OAuth provider to disconnect (e.g., google, microsoft)' }),
    ApiResponse({ status: 200, description: 'Provider disconnected.', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Cannot disconnect last auth method.' }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
    ApiResponse({ status: 404, description: 'Provider not linked.' }),
  );
}
