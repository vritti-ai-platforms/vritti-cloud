export const AUTH_STATUS_EVENTS = {
  PROFILE_UPDATED: 'auth-status.profile-updated',
  SESSION_REVOKED: 'auth-status.session-revoked',
} as const;

export class ProfileUpdatedEvent {
  constructor(public readonly userId: string) {}
}

export class SessionRevokedEvent {
  constructor(
    public readonly userId: string,
    public readonly sessionId?: string,
  ) {}
}
