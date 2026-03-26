// Services are imported directly from their domain files:
// @services/auth.service, @services/onboarding.service,
// @services/account.service, @services/account/verification.service
// @services/user.service

export { type AuthStatusResponse, getAuthStatus, logout, logoutAll, type User } from './user.service';
