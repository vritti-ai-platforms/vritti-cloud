import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessToken, RequireSession, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { SessionResponse } from '../../../cloud-api/auth/root/dto/entity/session-response.dto';
import {
  ApiChangePassword,
  ApiDisableTotp,
  ApiGetMfaStatus,
  ApiGetPasskeySetupOptions,
  ApiGetSessions,
  ApiListPasskeys,
  ApiRegenerateBackupCodes,
  ApiRemovePasskey,
  ApiRevokeAllSessions,
  ApiRevokeSession,
  ApiSetupTotp,
  ApiVerifyPasskeySetup,
  ApiVerifyTotpSetup,
} from '../docs/security.docs';
import { ChangePasswordDto } from '../dto/request/change-password.dto';
import { VerifyPasskeySetupDto } from '../dto/request/verify-passkey-setup.dto';
import { VerifyTotpSetupDto } from '../dto/request/verify-totp-setup.dto';
import { BackupCodesResponseDto } from '../dto/response/backup-codes-response.dto';
import { MfaStatusResponseDto, PasskeyInfoDto } from '../dto/response/mfa-status-response.dto';
import { TotpSetupResponseDto } from '../dto/response/totp-setup-response.dto';
import { SecurityService } from '../services/security.service';

@ApiTags('Account - Security')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('account/security')
export class SecurityController {
  private readonly logger = new Logger(SecurityController.name);

  constructor(private readonly securityService: SecurityService) {}

  // Changes the authenticated user's password
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiChangePassword()
  async changePassword(@UserId() userId: string, @Body() dto: ChangePasswordDto): Promise<SuccessResponseDto> {
    this.logger.log(`POST /account/security/change-password - userId: ${userId}`);
    return this.securityService.changePassword(userId, dto.currentPassword, dto.newPassword);
  }

  // Returns all active sessions for the authenticated user
  @Get('sessions')
  @ApiGetSessions()
  async getSessions(@UserId() userId: string, @AccessToken() accessToken: string): Promise<SessionResponse[]> {
    this.logger.log(`GET /account/security/sessions - userId: ${userId}`);
    return this.securityService.getSessions(userId, accessToken);
  }

  // Revokes a specific session by ID
  @Delete('sessions/:id')
  @ApiRevokeSession()
  async revokeSession(
    @UserId() userId: string,
    @Param('id') sessionId: string,
    @AccessToken() accessToken: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /account/security/sessions/${sessionId} - userId: ${userId}`);
    return this.securityService.revokeSession(userId, sessionId, accessToken);
  }

  // Revokes all sessions except the current one
  @Post('sessions/revoke-all')
  @HttpCode(HttpStatus.OK)
  @ApiRevokeAllSessions()
  async revokeAllSessions(@UserId() userId: string): Promise<SuccessResponseDto> {
    this.logger.log(`POST /account/security/sessions/revoke-all - userId: ${userId}`);
    return this.securityService.revokeAllSessions(userId);
  }

  // Returns the current MFA status for the authenticated user
  @Get('mfa/status')
  @ApiGetMfaStatus()
  async getMfaStatus(@UserId() userId: string): Promise<MfaStatusResponseDto> {
    this.logger.log(`GET /account/security/mfa/status - userId: ${userId}`);
    return this.securityService.getMfaStatus(userId);
  }

  // Initiates TOTP setup and returns the QR code URI
  @Post('mfa/totp/setup')
  @HttpCode(HttpStatus.OK)
  @ApiSetupTotp()
  async setupTotp(@UserId() userId: string): Promise<TotpSetupResponseDto> {
    this.logger.log(`POST /account/security/mfa/totp/setup - userId: ${userId}`);
    return this.securityService.initiateTotpSetup(userId);
  }

  // Verifies the TOTP code and activates MFA
  @Post('mfa/totp/verify-setup')
  @HttpCode(HttpStatus.OK)
  @ApiVerifyTotpSetup()
  async verifyTotpSetup(@UserId() userId: string, @Body() dto: VerifyTotpSetupDto): Promise<BackupCodesResponseDto> {
    this.logger.log(`POST /account/security/mfa/totp/verify-setup - userId: ${userId}`);
    return this.securityService.verifyTotpSetup(userId, dto.code);
  }

  // Disables TOTP-based MFA
  @Delete('mfa/totp')
  @ApiDisableTotp()
  async disableTotp(@UserId() userId: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /account/security/mfa/totp - userId: ${userId}`);
    return this.securityService.disableMfaMethod(userId, 'TOTP');
  }

  // Disables all MFA methods
  @Delete('mfa')
  async disableAllMfa(@UserId() userId: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /account/security/mfa - userId: ${userId}`);
    return this.securityService.disableAllMfa(userId);
  }

  // Returns WebAuthn registration options for passkey setup
  @Post('mfa/passkey/setup-options')
  @HttpCode(HttpStatus.OK)
  @ApiGetPasskeySetupOptions()
  async getPasskeySetupOptions(@UserId() userId: string): Promise<Record<string, unknown>> {
    this.logger.log(`POST /account/security/mfa/passkey/setup-options - userId: ${userId}`);
    return this.securityService.getPasskeySetupOptions(userId);
  }

  // Verifies the passkey registration and activates MFA
  @Post('mfa/passkey/verify-setup')
  @HttpCode(HttpStatus.OK)
  @ApiVerifyPasskeySetup()
  async verifyPasskeySetup(
    @UserId() userId: string,
    @Body() dto: VerifyPasskeySetupDto,
  ): Promise<BackupCodesResponseDto> {
    this.logger.log(`POST /account/security/mfa/passkey/verify-setup - userId: ${userId}`);
    return this.securityService.verifyPasskeySetup(userId, dto.credential as any);
  }

  // Lists all registered passkeys for the user
  @Get('mfa/passkeys')
  @ApiListPasskeys()
  async listPasskeys(@UserId() userId: string): Promise<PasskeyInfoDto[]> {
    this.logger.log(`GET /account/security/mfa/passkeys - userId: ${userId}`);
    return this.securityService.listPasskeys(userId);
  }

  // Removes a specific passkey by ID
  @Delete('mfa/passkey/:id')
  @ApiRemovePasskey()
  async removePasskey(@UserId() userId: string, @Param('id') passkeyId: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /account/security/mfa/passkey/${passkeyId} - userId: ${userId}`);
    return this.securityService.removePasskey(userId, passkeyId);
  }

  // Regenerates backup codes, invalidating the previous set
  @Post('mfa/backup-codes/regenerate')
  @HttpCode(HttpStatus.OK)
  @ApiRegenerateBackupCodes()
  async regenerateBackupCodes(@UserId() userId: string): Promise<BackupCodesResponseDto> {
    this.logger.log(`POST /account/security/mfa/backup-codes/regenerate - userId: ${userId}`);
    return this.securityService.regenerateBackupCodes(userId);
  }
}
