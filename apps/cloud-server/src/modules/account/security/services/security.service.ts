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

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly encryptionService: EncryptionService,
    private readonly eventEmitter: EventEmitter2,
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
    this.logger.log(`Session ${sessionId} revoked for user: ${userId}`);

    this.eventEmitter.emit(
      AUTH_STATUS_EVENTS.SESSION_REVOKED,
      new SessionRevokedEvent(userId),
    );

    return { success: true, message: 'Session revoked successfully.' };
  }

  // Revokes all sessions except the current one
  async revokeAllSessions(userId: string): Promise<SuccessResponseDto> {
    const count = await this.sessionService.invalidateAllUserSessions(userId);
    this.logger.log(`User logged out from all devices: ${userId} (${count} sessions revoked)`);

    this.eventEmitter.emit(
      AUTH_STATUS_EVENTS.SESSION_REVOKED,
      new SessionRevokedEvent(userId),
    );

    return { success: true, message: `Successfully revoked ${count} session(s).` };
  }
}
