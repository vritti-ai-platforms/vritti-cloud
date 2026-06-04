import { MediaService } from '@domain/media/services/media.service';
import { SessionService } from '@domain/session/services/session.service';
import { UserService } from '@domain/user/services/user.service';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConflictException, TokenService, TokenType, UnauthorizedException } from '@vritti/api-sdk';
import type { FastifyRequest } from 'fastify';
import { AccountStatusValues, OnboardingStepValues, SessionTypeValues } from '@/db/schema';
import { EncryptionService } from '../../../../../services';
import { UserDto } from '../../../user/dto/entity/user.dto';
import { MfaVerificationService } from '../../mfa-verification/services/mfa-verification.service';
import { LoginDto } from '../dto/request/login.dto';
import { SignupDto } from '../dto/request/signup.dto';
import { AuthStatusResponse } from '../dto/response/auth-status-response.dto';
import { LoginResponse } from '../dto/response/login-response.dto';
import { SignupResponseDto } from '../dto/response/signup-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly encryptionService: EncryptionService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly mediaService: MediaService,
    @Inject(forwardRef(() => MfaVerificationService))
    private readonly mfaVerificationService: MfaVerificationService,
  ) {}

  // Extracts first word from fullName for auto-deriving displayName
  private extractFirstWord(fullName: string): string {
    if (!fullName?.trim()) return fullName;
    return fullName.trim().split(/\s+/)[0];
  }

  // Creates a new user or sets password for OAuth users without one
  async signup(
    dto: SignupDto,
    request: FastifyRequest,
  ): Promise<SignupResponseDto & { refreshToken: string }> {
    const existingUser = await this.userService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException({
        label: 'Account Exists',
        detail: 'An account with this email already exists. Please log in instead.',
      });
    }

    // New user
    const passwordHash = await this.encryptionService.hashPassword(dto.password);

    const user = await this.userService.create(
      {
        email: dto.email,
        fullName: dto.fullName,
        displayName: this.extractFirstWord(dto.fullName),
      },
      passwordHash,
      true,
    );

    const { accessToken, refreshToken, expiresIn } = await this.sessionService.createSession(
      user.id,
      SessionTypeValues.ONBOARDING,
      request,
    );

    this.logger.log(`Created new user: ${user.email} (${user.id})`);

    return { ...SignupResponseDto.from(user, accessToken, expiresIn), refreshToken };
  }

  // Validates credentials and creates session, or returns MFA challenge if MFA is enabled
  async login(
    dto: LoginDto,
    subdomain: string | undefined,
    request: FastifyRequest,
  ): Promise<LoginResponse & { refreshToken?: string }> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException({
        label: 'Invalid Credentials',
        detail: 'The email or password you entered is incorrect. Please check your credentials and try again.',
      });
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException({
        label: 'Sign in with Provider',
        detail: 'This account was created with an OAuth provider. Please sign in using your provider.',
      });
    }

    const isPasswordValid = await this.encryptionService.comparePassword(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        label: 'Invalid Credentials',
        detail: 'The email or password you entered is incorrect. Please check your credentials and try again.',
      });
    }

    // Incomplete onboarding — create ONBOARDING session so user can resume
    if (user.onboardingStep !== OnboardingStepValues.COMPLETE) {
      this.logger.log(`Resuming onboarding for user: ${user.email} (${user.id})`);

      await this.sessionService.deleteOnboardingSessions(user.id);

      const { refreshToken } = await this.sessionService.createSession(
        user.id,
        SessionTypeValues.ONBOARDING,
        request,
      );

      return {
        ...new LoginResponse({ requiresOnboarding: true }),
        refreshToken,
      };
    }

    // Only ACTIVE users can login
    if (user.accountStatus !== AccountStatusValues.ACTIVE) {
      throw new UnauthorizedException({
        label: 'Account Unavailable',
        detail: `Your account is ${user.accountStatus.toLowerCase()}. Please contact support for assistance.`,
      });
    }

    // Admin subdomain requires admin privileges
    const isAdminLogin = subdomain === 'admin';
    if (isAdminLogin && !user.isAdmin) {
      throw new UnauthorizedException({
        label: 'Access Denied',
        detail: 'You do not have permission to access the admin portal.',
      });
    }

    // Check if user has MFA enabled
    const mfaChallenge = await this.mfaVerificationService.createMfaChallenge(user, {
      subdomain,
    });

    if (mfaChallenge) {
      this.logger.log(`User login requires MFA: ${user.email} (${user.id})`);

      return new LoginResponse({
        requiresMfa: true,
        mfaChallenge: {
          sessionId: mfaChallenge.sessionId,
          availableMethods: mfaChallenge.availableMethods,
          defaultMethod: mfaChallenge.defaultMethod,
          maskedPhone: mfaChallenge.maskedPhone,
        },
      });
    }

    // No MFA — create session based on subdomain
    const sessionType = isAdminLogin ? SessionTypeValues.ADMIN : SessionTypeValues.CLOUD;
    const { accessToken, refreshToken } = await this.sessionService.createSession(
      user.id,
      sessionType,
      request,
    );

    // Delete all onboarding sessions (user has completed onboarding)
    await this.sessionService.deleteOnboardingSessions(user.id);

    await this.userService.updateLastLogin(user.id);

    this.logger.log(`User logged in: ${user.email} (${user.id})`);

    return {
      ...new LoginResponse({
        accessToken,
        expiresIn: this.tokenService.getExpiryInSeconds(TokenType.ACCESS),
        user: UserDto.from(user),
      }),
      refreshToken,
    };
  }

  // Returns { isAuthenticated: false } instead of throwing (never 401)
  async getAuthStatus(refreshToken: string | undefined): Promise<AuthStatusResponse> {
    if (!refreshToken) {
      return new AuthStatusResponse({ isAuthenticated: false });
    }

    try {
      const { accessToken, expiresIn, userId, sessionType, sessionId } =
        await this.sessionService.generateAccessToken(refreshToken);

      const user = await this.userService.findById(userId);

      if (user.mediaId) {
        const presignedUrl = await this.mediaService.getPresignedUrl(user.mediaId);
        user.profilePictureUrl = presignedUrl.url;
      }

      // Onboarding sessions return tokens but are not fully authenticated
      if (sessionType === SessionTypeValues.ONBOARDING) {
        return new AuthStatusResponse({
          isAuthenticated: false,
          requiresOnboarding: true,
          user,
          accessToken,
          expiresIn,
          sessionId,
        });
      }

      // RESET sessions are temporary password-reset flows, not authenticated
      if (sessionType === SessionTypeValues.RESET) {
        return new AuthStatusResponse({ isAuthenticated: false });
      }

      this.logger.log(`Session recovered for user: ${userId}`);

      return new AuthStatusResponse({ isAuthenticated: true, user, accessToken, expiresIn, sessionId });
    } catch {
      return new AuthStatusResponse({ isAuthenticated: false });
    }
  }

  // Recovers access token from httpOnly cookie without rotating refresh token
  async getAccessToken(refreshToken: string | undefined): Promise<{ accessToken: string; expiresIn: number }> {
    return this.sessionService.generateAccessToken(refreshToken);
  }

  // Rotates both tokens and returns new access + refresh tokens
  async refreshTokens(
    refreshToken: string | undefined,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    return this.sessionService.refreshTokens(refreshToken);
  }

  // Invalidates the session associated with the given access token
  async logout(accessToken: string): Promise<void> {
    await this.sessionService.invalidateSession(accessToken);
    this.logger.log('User logged out');
  }

  // Validates that a user exists and has an active account
  async validateUser(userId: string): Promise<UserDto> {
    const user = await this.userService.findById(userId);

    if (user.accountStatus !== AccountStatusValues.ACTIVE) {
      throw new UnauthorizedException({
        label: 'Account Inactive',
        detail: 'Your account is not active. Please contact support for assistance.',
      });
    }

    return user;
  }

}
