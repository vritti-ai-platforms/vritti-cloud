import { MediaService } from '@domain/media/services/media.service';
import { UserService } from '@domain/user/services/user.service';
import { Injectable, Logger, type MessageEvent } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AUTH_STATUS_EVENTS, ProfileUpdatedEvent, SessionRevokedEvent } from '../events/auth-status.events';
import { AuthStatusSseService } from '../services/auth-status-sse.service';

@Injectable()
export class AuthStatusEventListener {
  private readonly logger = new Logger(AuthStatusEventListener.name);

  constructor(
    private readonly authStatusSse: AuthStatusSseService,
    private readonly userService: UserService,
    private readonly mediaService: MediaService,
  ) {}

  // Re-pushes full auth-state with fresh user data
  @OnEvent(AUTH_STATUS_EVENTS.PROFILE_UPDATED)
  async handleProfileUpdated(event: ProfileUpdatedEvent) {
    this.logger.log(`Handling PROFILE_UPDATED for user ${event.userId}`);

    try {
      const user = await this.userService.findById(event.userId);

      if (user.mediaId) {
        const presignedUrl = await this.mediaService.getPresignedUrl(user.mediaId);
        user.profilePictureUrl = presignedUrl.url;
      }

      const message: MessageEvent = {
        type: 'auth-state',
        data: JSON.stringify({ isAuthenticated: true, user }),
      };

      this.authStatusSse.sendToUser(event.userId, message);
    } catch (error) {
      this.logger.error(`Failed to handle PROFILE_UPDATED for user ${event.userId}: ${error}`);
    }
  }

  // Pushes session-revoked to trigger logout on affected clients
  @OnEvent(AUTH_STATUS_EVENTS.SESSION_REVOKED)
  handleSessionRevoked(event: SessionRevokedEvent) {
    this.logger.log(`Handling SESSION_REVOKED for user ${event.userId}`);

    const message: MessageEvent = {
      type: 'session-revoked',
      data: JSON.stringify({}),
    };

    this.authStatusSse.sendToUser(event.userId, message);
  }
}
