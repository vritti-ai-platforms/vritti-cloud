import { MfaRepository } from '@domain/mfa/repositories/mfa.repository';
import { BackupCodeService } from '@domain/mfa/services/backup-code.service';
import { TotpService } from '@domain/mfa/services/totp.service';
import { WebAuthnService } from '@domain/mfa/services/webauthn.service';
import type { AuthenticatorTransportFuture, RegistrationResponseJSON } from '@domain/mfa/types/webauthn.types';
import { SessionService } from '@domain/session/services/session.service';
import { UserService } from '@domain/user/services/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BadRequestException,
  hashToken,
  NotFoundException,
  SuccessResponseDto,
  UnauthorizedException,
} from '@vritti/api-sdk';
import { EncryptionService } from '@/services';
import { SessionResponse } from '../../../cloud-api/auth/root/dto/entity/session-response.dto';
import { AUTH_STATUS_EVENTS, SessionRevokedEvent } from '../../../cloud-api/auth/root/events/auth-status.events';
import { BackupCodesResponseDto } from '../dto/response/backup-codes-response.dto';
import { MfaStatusResponseDto, PasskeyInfoDto } from '../dto/response/mfa-status-response.dto';
import { TotpSetupResponseDto } from '../dto/response/totp-setup-response.dto';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly encryptionService: EncryptionService,
    private readonly eventEmitter: EventEmitter2,
    private readonly totpService: TotpService,
    private readonly webAuthnService: WebAuthnService,
    private readonly backupCodeService: BackupCodeService,
    private readonly mfaRepo: MfaRepository,
  ) {}

  // Verifies current password and updates to a new one
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<SuccessResponseDto> {
    const userResponse = await this.userService.findById(userId);
    const user = await this.userService.findByEmail(userResponse.email);

    if (!user) {
      throw new UnauthorizedException("We couldn't find your account. Please log in again.");
    }

    if (!user.passwordHash) {
      throw new BadRequestException({
        label: 'No Password Set',
        detail: 'Your account does not have a password set. Please use password recovery or OAuth sign-in.',
        errors: [{ field: 'password', message: 'No password set' }],
      });
    }

    const isCurrentPasswordValid = await this.encryptionService.comparePassword(currentPassword, user.passwordHash);

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('The current password you entered is incorrect. Please try again.');
    }

    const isSamePassword = await this.encryptionService.comparePassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new BadRequestException({
        label: 'Password Already In Use',
        detail: 'Your new password must be different from your current password.',
        errors: [{ field: 'newPassword', message: 'Password already in use' }],
      });
    }

    const newPasswordHash = await this.encryptionService.hashPassword(newPassword);

    await this.userService.update(user.id, { passwordHash: newPasswordHash });

    this.logger.log(`Password changed for user: ${user.id}`);

    return { success: true, message: 'Password changed successfully.' };
  }

  // Returns all active sessions for the user, marking the current one by access token hash
  async getSessions(userId: string, currentAccessToken: string): Promise<SessionResponse[]> {
    const sessions = await this.sessionService.getUserActiveSessions(userId);
    const currentAccessTokenHash = hashToken(currentAccessToken);
    return sessions.map((session) => SessionResponse.from(session, currentAccessTokenHash));
  }

  // Revokes a specific session, preventing revocation of the current one
  async revokeSession(userId: string, sessionId: string, currentAccessToken: string): Promise<SuccessResponseDto> {
    const currentSession = await this.sessionService.validateAccessToken(currentAccessToken);
    if (currentSession.id === sessionId) {
      throw new BadRequestException({
        label: 'Cannot Revoke',
        detail: 'You cannot revoke your current session. Use logout instead.',
      });
    }

    const sessions = await this.sessionService.getUserActiveSessions(userId);
    const targetSession = sessions.find((s) => s.id === sessionId);

    if (!targetSession) {
      throw new NotFoundException('The session you are trying to revoke does not exist or has already been revoked.');
    }

    if (targetSession.userId !== userId) {
      throw new UnauthorizedException('You do not have permission to revoke this session.');
    }

    await this.sessionService.deleteSessionById(targetSession.id);

    this.eventEmitter.emit(AUTH_STATUS_EVENTS.SESSION_REVOKED, new SessionRevokedEvent(userId, targetSession.id));

    this.logger.log(`Session ${sessionId} revoked for user: ${userId}`);

    return { success: true, message: 'Session revoked successfully.' };
  }

  // Revokes all sessions except the current one
  async revokeAllSessions(userId: string): Promise<SuccessResponseDto> {
    const count = await this.sessionService.invalidateAllUserSessions(userId);
    this.logger.log(`User logged out from all devices: ${userId} (${count} sessions revoked)`);

    this.eventEmitter.emit(AUTH_STATUS_EVENTS.SESSION_REVOKED, new SessionRevokedEvent(userId));

    return { success: true, message: `Successfully revoked ${count} session(s).` };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MFA Status
  // ──────────────────────────────────────────────────────────────────────────

  // Retrieves all active MFA records and returns aggregated status
  async getMfaStatus(userId: string): Promise<MfaStatusResponseDto> {
    const mfaRecords = await this.mfaRepo.findAllActiveByUserId(userId);

    if (mfaRecords.length === 0) {
      return new MfaStatusResponseDto({
        isEnabled: false,
        methods: [],
        backupCodesRemaining: 0,
        passkeys: null,
        lastUsedAt: null,
        createdAt: null,
      });
    }

    const methods = [...new Set(mfaRecords.map((r) => r.method))];
    const first = mfaRecords[0];

    // Backup codes are synced across all records — read from first
    let backupCodesRemaining = 0;
    if (first.totpBackupCodes) {
      try {
        backupCodesRemaining = (JSON.parse(first.totpBackupCodes) as string[]).length;
      } catch {
        this.logger.warn(`Failed to parse backup codes for MFA ${first.id}`);
      }
    }

    const passkeys = await this.mfaRepo.findAllPasskeysByUserId(userId);
    const passkeyDtos = passkeys.map(
      (p) =>
        new PasskeyInfoDto({
          id: p.id,
          credentialId: p.passkeyCredentialId ?? '',
          createdAt: p.createdAt,
        }),
    );

    return new MfaStatusResponseDto({
      isEnabled: true,
      methods,
      backupCodesRemaining,
      passkeys: passkeyDtos.length > 0 ? passkeyDtos : null,
      lastUsedAt: first.lastUsedAt,
      createdAt: first.createdAt,
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TOTP Setup
  // ──────────────────────────────────────────────────────────────────────────

  // Generates a TOTP secret, persists a pending record, and returns the QR code URI
  async initiateTotpSetup(userId: string): Promise<TotpSetupResponseDto> {
    const user = await this.userService.findById(userId);

    const existingTotp = await this.mfaRepo.findActiveByUserIdAndMethod(userId, 'TOTP');
    if (existingTotp) {
      throw new BadRequestException({
        label: 'TOTP Already Configured',
        detail: 'Authenticator app is already enabled. Disable it first to set up a new one.',
      });
    }

    // Delete any stale pending TOTP record from a previous incomplete setup
    await this.mfaRepo.deletePendingByUserIdAndMethod(userId, 'TOTP');

    const secret = this.totpService.generateTotpSecret();
    const keyUri = this.totpService.generateKeyUri(user.email, secret);

    await this.mfaRepo.createPendingTotp(userId, secret);

    this.logger.log(`Initiated TOTP setup for user: ${userId}`);

    return new TotpSetupResponseDto({
      keyUri,
      manualSetupKey: this.totpService.formatSecretForDisplay(secret),
      issuer: this.totpService.getIssuer(),
      accountName: user.email,
    });
  }

  // Validates the TOTP code against the pending record and activates MFA with backup codes
  async verifyTotpSetup(userId: string, code: string): Promise<BackupCodesResponseDto> {
    const pending = await this.mfaRepo.findPendingByUserIdAndMethod(userId, 'TOTP');
    if (!pending || !pending.totpSecret) {
      throw new NotFoundException({
        label: 'No Pending Setup',
        detail: 'Your setup session could not be found. Please start the process again.',
      });
    }

    const isValid = this.totpService.verifyToken(code, pending.totpSecret);
    if (!isValid) {
      throw new BadRequestException({
        label: 'Invalid Code',
        detail: 'The code you entered is incorrect. Please check your authenticator app and try again.',
        errors: [{ field: 'code', message: 'Incorrect code' }],
      });
    }

    const backupCodes = this.backupCodeService.generateBackupCodes();
    const hashedBackupCodes = await this.backupCodeService.hashBackupCodes(backupCodes);

    await this.mfaRepo.confirmTotp(pending.id, JSON.stringify(hashedBackupCodes));

    // Sync backup codes to all other active MFA records so codes are shared
    const otherRecords = await this.mfaRepo.findAllActiveByUserId(userId);
    await Promise.all(
      otherRecords
        .filter((r) => r.id !== pending.id)
        .map((r) => this.mfaRepo.updateBackupCodes(r.id, hashedBackupCodes)),
    );

    this.logger.log(`TOTP setup completed for user: ${userId}`);

    return new BackupCodesResponseDto({
      success: true,
      message: 'Multi-factor authentication has been enabled successfully.',
      backupCodes,
      warning:
        'Save these backup codes in a secure location. Each code can only be used once and they will not be shown again.',
    });
  }

  // Deactivates a specific MFA method for the user
  async disableMfaMethod(userId: string, method: 'TOTP' | 'PASSKEY'): Promise<SuccessResponseDto> {
    const mfaRecord = await this.mfaRepo.findActiveByUserIdAndMethod(userId, method);
    if (!mfaRecord) {
      const label = method === 'TOTP' ? 'Authenticator App' : 'Passkey';
      throw new NotFoundException({
        label: `${label} Not Enabled`,
        detail: `${label} is not currently enabled on your account.`,
      });
    }

    await this.mfaRepo.deactivateByUserIdAndMethod(userId, method);

    const label = method === 'TOTP' ? 'Authenticator app' : 'Passkey';
    this.logger.log(`${method} MFA disabled for user: ${userId}`);

    return { success: true, message: `${label} has been disabled.` };
  }

  // Deactivates all MFA methods for the user
  async disableAllMfa(userId: string): Promise<SuccessResponseDto> {
    const records = await this.mfaRepo.findAllActiveByUserId(userId);
    if (records.length === 0) {
      throw new NotFoundException({
        label: 'MFA Not Enabled',
        detail: 'There is no active multi-factor authentication to disable.',
      });
    }

    await this.mfaRepo.deactivateAllByUserId(userId);

    this.logger.log(`All MFA disabled for user: ${userId}`);

    return { success: true, message: 'All multi-factor authentication methods have been disabled.' };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Passkey Setup
  // ──────────────────────────────────────────────────────────────────────────

  // Generates WebAuthn registration options and stores the challenge as a pending record
  async getPasskeySetupOptions(userId: string): Promise<Record<string, unknown>> {
    const user = await this.userService.findById(userId);

    // Delete any stale pending passkey record from a previous incomplete setup
    await this.mfaRepo.deletePendingByUserIdAndMethod(userId, 'PASSKEY');

    const existingPasskeys = await this.mfaRepo.findAllPasskeysByUserId(userId);
    const excludeCredentials = existingPasskeys
      .filter((p): p is typeof p & { passkeyCredentialId: string } => !!p.passkeyCredentialId)
      .map((p) => ({
        id: p.passkeyCredentialId,
        transports: p.passkeyTransports
          ? (JSON.parse(p.passkeyTransports) as AuthenticatorTransportFuture[])
          : undefined,
      }));

    const options = await this.webAuthnService.generateRegistrationOptions(
      userId,
      user.email,
      user.fullName || user.email,
      excludeCredentials,
    );

    await this.mfaRepo.createPendingPasskey(userId, options.challenge);

    this.logger.log(`Initiated Passkey setup for user: ${userId}`);

    return options as unknown as Record<string, unknown>;
  }

  // Verifies the passkey registration response and activates MFA with backup codes
  async verifyPasskeySetup(userId: string, credential: RegistrationResponseJSON): Promise<BackupCodesResponseDto> {
    const pending = await this.mfaRepo.findPendingByUserIdAndMethod(userId, 'PASSKEY');
    if (!pending || !pending.pendingChallenge) {
      throw new NotFoundException({
        label: 'No Pending Setup',
        detail: 'Your setup session could not be found. Please start the process again.',
      });
    }

    const { registrationInfo } = await this.webAuthnService
      .verifyRegistration(credential, pending.pendingChallenge)
      .catch((error: Error) => {
        this.logger.error(`Passkey verification failed: ${error.message}`);
        throw new BadRequestException({
          label: 'Passkey Verification Failed',
          detail: 'Could not verify your passkey. Please try again.',
        });
      });

    const backupCodes = this.backupCodeService.generateBackupCodes();
    const hashedBackupCodes = await this.backupCodeService.hashBackupCodes(backupCodes);

    const credentialIdBase64 = registrationInfo.credential.id;
    const publicKeyBase64 = this.webAuthnService.uint8ArrayToBase64url(registrationInfo.credential.publicKey);
    const transports = (registrationInfo.credential.transports as string[]) || [];

    await this.mfaRepo.confirmPasskey(
      pending.id,
      credentialIdBase64,
      publicKeyBase64,
      registrationInfo.credential.counter,
      JSON.stringify(transports),
      JSON.stringify(hashedBackupCodes),
    );

    // Sync backup codes to all other active MFA records so codes are shared
    const otherRecords = await this.mfaRepo.findAllActiveByUserId(userId);
    await Promise.all(
      otherRecords
        .filter((r) => r.id !== pending.id)
        .map((r) => this.mfaRepo.updateBackupCodes(r.id, hashedBackupCodes)),
    );

    this.logger.log(`Passkey setup completed for user: ${userId}`);

    return new BackupCodesResponseDto({
      success: true,
      message: 'Passkey has been registered successfully.',
      backupCodes,
      warning:
        'Save these backup codes in a secure location. Each code can only be used once and they will not be shown again.',
    });
  }

  // Returns all registered passkeys for the user
  async listPasskeys(userId: string): Promise<PasskeyInfoDto[]> {
    const passkeys = await this.mfaRepo.findAllPasskeysByUserId(userId);

    return passkeys.map(
      (p) =>
        new PasskeyInfoDto({
          id: p.id,
          credentialId: p.passkeyCredentialId ?? '',
          createdAt: p.createdAt,
        }),
    );
  }

  // Removes a specific passkey by ID, deactivating MFA if it was the last one
  async removePasskey(userId: string, passkeyId: string): Promise<SuccessResponseDto> {
    const passkeys = await this.mfaRepo.findAllPasskeysByUserId(userId);
    const target = passkeys.find((p) => p.id === passkeyId);

    if (!target) {
      throw new NotFoundException('The passkey you are trying to remove does not exist.');
    }

    if (target.userId !== userId) {
      throw new UnauthorizedException('You do not have permission to remove this passkey.');
    }

    await this.mfaRepo.update(passkeyId, { isActive: false });

    this.logger.log(`Passkey ${passkeyId} removed for user: ${userId}`);

    return { success: true, message: 'Passkey removed successfully.' };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Backup Codes
  // ──────────────────────────────────────────────────────────────────────────

  // Generates new backup codes, hashes them, and replaces the stored set on all active MFA records
  async regenerateBackupCodes(userId: string): Promise<BackupCodesResponseDto> {
    const mfaRecords = await this.mfaRepo.findAllActiveByUserId(userId);
    if (mfaRecords.length === 0) {
      throw new NotFoundException({
        label: 'MFA Not Enabled',
        detail: 'You must have multi-factor authentication enabled to regenerate backup codes.',
      });
    }

    const backupCodes = this.backupCodeService.generateBackupCodes();
    const hashedBackupCodes = await this.backupCodeService.hashBackupCodes(backupCodes);

    // Update backup codes on all active MFA records
    await Promise.all(mfaRecords.map((record) => this.mfaRepo.updateBackupCodes(record.id, hashedBackupCodes)));

    this.logger.log(`Backup codes regenerated for user: ${userId}`);

    return new BackupCodesResponseDto({
      success: true,
      message: 'New backup codes have been generated. Your previous codes are no longer valid.',
      backupCodes,
      warning:
        'Save these backup codes in a secure location. Each code can only be used once and they will not be shown again.',
    });
  }
}
