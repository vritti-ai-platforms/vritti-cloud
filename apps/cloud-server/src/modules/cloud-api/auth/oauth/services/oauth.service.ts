import { OAuthPendingLinkDomainRepository } from '@domain/oauth/repositories/oauth-pending-link.repository';
import { OAuthProviderDomainRepository } from '@domain/oauth/repositories/oauth-provider.repository';
import { SessionDomainService } from '@domain/session/services/session.service';
import { UserDomainRepository } from '@domain/user/repositories/user.repository';
import { VerificationDomainService } from '@domain/verification/services/verification.service';
import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '@vritti/api-sdk/email';
import { BadRequestException, UnauthorizedException } from '@vritti/api-sdk/exceptions';
import type { FastifyRequest } from 'fastify';
import {
  type OAuthProviderType,
  OAuthProviderTypeValues,
  OnboardingStepValues,
  type SessionType,
  SessionTypeValues,
  SignupMethodValues,
  type User,
  VerificationChannelValues,
} from '@/db/schema';
import type { IOAuthProvider } from '../interfaces/oauth-provider.interface';
import type { OAuthTokens } from '../interfaces/oauth-tokens.interface';
import type { OAuthUserProfile } from '../interfaces/oauth-user-profile.interface';
// import { AppleOAuthProvider } from '../providers/apple-oauth.provider';
import { FacebookOAuthProvider } from '../providers/facebook-oauth.provider';
import { GoogleOAuthProvider } from '../providers/google-oauth.provider';
import { MicrosoftOAuthProvider } from '../providers/microsoft-oauth.provider';
import { TwitterOAuthProvider } from '../providers/twitter-oauth.provider';
import { OAuthCryptoService } from './oauth-crypto.service';
import { OAuthStateService } from './oauth-state.service';

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);
  private readonly providers: Map<OAuthProviderType, IOAuthProvider>;

  // How long a stashed pending link (and its OTP) remains valid before the user must retry
  private readonly PENDING_LINK_EXPIRY_MINUTES = 10;

  constructor(
    private readonly userRepository: UserDomainRepository,
    private readonly oauthStateService: OAuthStateService,
    private readonly oauthProviderRepository: OAuthProviderDomainRepository,
    private readonly oauthPendingLinkRepository: OAuthPendingLinkDomainRepository,
    private readonly oauthCryptoService: OAuthCryptoService,
    private readonly sessionService: SessionDomainService,
    private readonly verificationService: VerificationDomainService,
    private readonly emailService: EmailService,
    private readonly googleProvider: GoogleOAuthProvider,
    private readonly microsoftProvider: MicrosoftOAuthProvider,
    // private readonly appleProvider: AppleOAuthProvider,
    private readonly facebookProvider: FacebookOAuthProvider,
    private readonly twitterProvider: TwitterOAuthProvider,
  ) {
    this.providers = new Map([
      [OAuthProviderTypeValues.GOOGLE, this.googleProvider],
      [OAuthProviderTypeValues.MICROSOFT, this.microsoftProvider],
      // [OAuthProviderTypeValues.APPLE, this.appleProvider],
      [OAuthProviderTypeValues.FACEBOOK, this.facebookProvider],
      [OAuthProviderTypeValues.X, this.twitterProvider],
    ] as [OAuthProviderType, IOAuthProvider][]);
  }

  // Generates an authorization URL with PKCE and state, then stores the state in DB
  async initiateOAuth(providerStr: string, origin: string): Promise<{ url: string }> {
    const provider = this.validateProviderString(providerStr);
    const oauthProvider = this.getProvider(provider);

    // Generate PKCE code verifier and challenge
    const codeVerifier = this.oauthCryptoService.generateCodeVerifier();
    const codeChallenge = this.oauthCryptoService.generateCodeChallenge(codeVerifier);

    // Generate and store state token with the validated initiating origin
    const state = await this.oauthStateService.generateState(provider, undefined, codeVerifier, origin);

    // Build the redirect URI on the initiating origin so the callback returns to the same subdomain
    const redirectUri = this.buildRedirectUri(origin, provider);

    // Get authorization URL from provider
    const url = oauthProvider.getAuthorizationUrl(state, redirectUri, codeChallenge);

    this.logger.log(`Initiated OAuth flow for provider: ${provider}`);

    return { url };
  }

  // Exchanges code for tokens, creates session, and returns redirect URL with refresh token
  async handleCallback(
    providerStr: string,
    code: string | undefined,
    state: string,
    request: FastifyRequest,
    error?: string,
    errorDescription?: string,
  ): Promise<{ redirectUrl: string; refreshToken: string }> {
    // Resolve the redirect base from the origin stored on the state; reject if it can't be determined
    const redirectBase = await this.oauthStateService.peekOrigin(state);
    if (!redirectBase) {
      throw new UnauthorizedException('The authentication request could not be verified. Please try logging in again.');
    }

    try {
      // Check for OAuth error response (user cancelled or provider error)
      if (error) {
        this.logger.warn(`OAuth error: ${error} - ${errorDescription || 'No description'}`);

        // Reflect only a normalized code + our own copy — never the provider's raw error/description text
        const isCancelled = error === 'access_denied';
        const params = new URLSearchParams({
          error: isCancelled ? 'access_denied' : 'authentication_failed',
          error_description: isCancelled
            ? 'You cancelled the authentication process. Please try again if you want to continue.'
            : 'Authentication failed. Please try again.',
        });
        const redirectUrl = `${redirectBase}/auth-error?${params.toString()}`;
        return { redirectUrl, refreshToken: '' };
      }

      // Code is required if no error
      if (!code) {
        throw new BadRequestException('Authorization code is required.');
      }

      const provider = this.validateProviderString(providerStr);

      // Validate and consume state token
      const stateData = await this.oauthStateService.validateAndConsumeState(state);

      // Verify provider matches
      if (stateData.provider !== provider) {
        throw new UnauthorizedException(
          'The authentication provider does not match your request. Please try logging in again.',
        );
      }

      const oauthProvider = this.getProvider(provider);

      // Rebuild the same redirect URI (from the stored origin) used at authorization time
      const redirectUri = this.buildRedirectUri(redirectBase, provider);

      // Exchange code for tokens
      const tokens = await oauthProvider.exchangeCodeForToken(code, redirectUri, stateData.codeVerifier);

      // Get user profile from provider
      const profile = await oauthProvider.getUserProfile(tokens.accessToken);

      // Case 1: This provider identity is already linked → log in by providerId (email is NOT consulted)
      const existingLink = await this.oauthProviderRepository.findByProviderAndProviderId(
        profile.provider,
        profile.providerId,
      );
      if (existingLink) {
        return await this.handleLinkedProviderLogin(existingLink.userId, profile, tokens, request, redirectBase);
      }

      // No prior link for this provider — resolve by email
      const existingUser = await this.userRepository.findByEmail(profile.email);

      // Case 2: Email collides with an existing account, but the provider hasn't been linked before
      if (existingUser) {
        // Trusted (provider-verified) email → link + login as before
        if (profile.emailVerified) {
          return existingUser.onboardingStep === OnboardingStepValues.COMPLETE
            ? await this.handleExistingCompleteUser(existingUser, profile, tokens, request, redirectBase)
            : await this.handleExistingIncompleteUser(existingUser, profile, tokens, request, redirectBase);
        }

        // Untrusted email → do NOT link; require ownership proof via OTP to the account's real email
        return await this.handleUnverifiedEmailCollision(existingUser, profile, tokens, request, redirectBase);
      }

      // Case 3: No user exists → create new user
      return await this.handleNewUser(profile, tokens, request, redirectBase);
    } catch (error) {
      this.logger.error('OAuth callback error', error);
      // Never reflect internal/exception text into the URL — send a fixed generic code + message
      const params = new URLSearchParams({
        error: 'authentication_failed',
        error_description: 'Authentication failed. Please try again.',
      });
      const redirectUrl = `${redirectBase}/auth-error?${params.toString()}`;
      return { redirectUrl, refreshToken: '' };
    }
  }

  // Verifies the OTP, commits the stashed provider link, and completes login for the OAUTH_VERIFY session
  async verifyEmailAndLink(
    userId: string,
    code: string,
    subdomain: string | undefined,
    request: FastifyRequest,
  ): Promise<{ success: boolean; message: string; requiresOnboarding: boolean; refreshToken: string }> {
    // Validate the OTP first — throws (RFC 9457) on an incorrect or expired code
    await this.verificationService.verifyVerification(code, VerificationChannelValues.EMAIL, userId);

    // Load and validate the stashed pending link
    const pending = await this.oauthPendingLinkRepository.findByUserId(userId);
    if (!pending || new Date() > pending.expiresAt) {
      if (pending) await this.oauthPendingLinkRepository.deleteByUserId(userId);
      throw new UnauthorizedException(
        'Your verification session has expired. Please sign in with your provider again.',
      );
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      await this.oauthPendingLinkRepository.deleteByUserId(userId);
      throw new UnauthorizedException('Your account could not be found. Please sign in again.');
    }

    // Commit the provider link now that ownership of the email is proven
    const profile: OAuthUserProfile = {
      provider: pending.provider,
      providerId: pending.providerId,
      email: pending.email,
      emailVerified: true,
      profilePictureUrl: pending.profilePictureUrl ?? undefined,
    };
    await this.oauthProviderRepository.upsert(
      userId,
      profile,
      pending.accessToken ?? '',
      pending.refreshToken ?? undefined,
      pending.tokenExpiresAt ?? undefined,
    );
    this.logger.log(`Linked OAuth provider ${pending.provider} to user ${userId} after email verification`);

    // Mark the account email verified if it wasn't already
    if (!user.emailVerified) {
      await this.userRepository.markEmailVerified(userId);
    }

    // One-time consumption of the pending link and cleanup of the restricted verify session(s)
    await this.oauthPendingLinkRepository.deleteByUserId(userId);
    await this.sessionService.deleteSessionsByType(userId, SessionTypeValues.OAUTH_VERIFY);

    // Complete login — admin subdomain requires admin privileges; incomplete users stay in ONBOARDING
    const isOnboarded = user.onboardingStep === OnboardingStepValues.COMPLETE;
    let sessionType: SessionType = SessionTypeValues.ONBOARDING;
    if (isOnboarded) {
      if (!subdomain) {
        throw new UnauthorizedException('The originating application could not be determined. Please sign in again.');
      }
      const isAdminLogin = subdomain === 'admin';
      if (isAdminLogin && !user.isAdmin) {
        throw new UnauthorizedException({
          label: 'Access Denied',
          detail: 'You do not have permission to access the admin portal.',
        });
      }
      sessionType = isAdminLogin ? SessionTypeValues.ADMIN : SessionTypeValues.CLOUD;
    }
    const { refreshToken } = await this.sessionService.createSession(userId, sessionType, request);

    if (isOnboarded) {
      await this.sessionService.deleteOnboardingSessions(userId);
      await this.userRepository.updateLastLogin(userId);
    }

    this.logger.log(`OAuth email verified and linked for user ${userId}, sessionType: ${sessionType}`);

    return {
      success: true,
      message: 'Your email has been verified and your account is now linked.',
      requiresOnboarding: !isOnboarded,
      refreshToken,
    };
  }

  // Resends the email OTP for an in-flight pending link (OAUTH_VERIFY session)
  async resendVerificationOtp(userId: string): Promise<{ success: boolean; message: string }> {
    const pending = await this.oauthPendingLinkRepository.findByUserId(userId);
    if (!pending || new Date() > pending.expiresAt) {
      if (pending) await this.oauthPendingLinkRepository.deleteByUserId(userId);
      throw new UnauthorizedException(
        'Your verification session has expired. Please sign in with your provider again.',
      );
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Your account could not be found. Please sign in again.');
    }

    const { otp, expiresAt } = await this.verificationService.createVerification(
      userId,
      VerificationChannelValues.EMAIL,
      pending.email,
    );
    this.emailService
      .sendVerificationEmail(pending.email, otp, expiresAt, user.displayName)
      .then(() => this.logger.log(`Resent OAuth link verification OTP to ${pending.email}`))
      .catch((sendError) => this.logger.error(`Failed to resend OAuth link verification email: ${sendError.message}`));

    return { success: true, message: 'A new verification code has been sent to your email.' };
  }

  private validateProviderString(providerStr: string): OAuthProviderType {
    const upperProvider = providerStr.toUpperCase();

    if (!Object.values(OAuthProviderTypeValues).includes(upperProvider as OAuthProviderType)) {
      throw new BadRequestException({
        label: 'Invalid Provider',
        detail: 'The selected login method is not supported. Please choose a different option.',
        errors: [{ field: 'provider', message: 'Unsupported provider' }],
      });
    }

    return upperProvider as OAuthProviderType;
  }

  private getProvider(provider: OAuthProviderType): IOAuthProvider {
    const oauthProvider = this.providers.get(provider);
    if (!oauthProvider) {
      throw new BadRequestException('The selected login method is not available. Please choose a different option.');
    }
    return oauthProvider;
  }

  // Builds the callback URL on the initiating frontend origin (routes to the backend via its /api proxy)
  private buildRedirectUri(origin: string, provider: OAuthProviderType): string {
    return `${origin}/api/auth/oauth/${provider.toLowerCase()}/callback`;
  }

  // Determines whether the initiating origin is the admin subdomain
  private isAdminOrigin(origin: string): boolean {
    return new URL(origin).hostname.split('.')[0] === 'admin';
  }

  // Logs in a user whose provider identity is already linked (Case 1) — refreshes tokens for the same user
  private async handleLinkedProviderLogin(
    userId: string,
    profile: OAuthUserProfile,
    tokens: OAuthTokens,
    request: FastifyRequest,
    redirectBase: string,
  ): Promise<{ redirectUrl: string; refreshToken: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Your account could not be found. Please sign in again.');
    }

    if (user.onboardingStep === OnboardingStepValues.COMPLETE) {
      this.logger.log(`Existing OAuth link login for user: ${user.id}`);
      return this.handleExistingCompleteUser(user, profile, tokens, request, redirectBase);
    }

    this.logger.log(`Existing OAuth link resuming onboarding for user: ${user.id}`);
    return this.handleExistingIncompleteUser(user, profile, tokens, request, redirectBase);
  }

  // Untrusted-email collision (Case 2): stash the link, OTP the account's real email, issue an OAUTH_VERIFY session
  private async handleUnverifiedEmailCollision(
    existingUser: User,
    profile: OAuthUserProfile,
    tokens: OAuthTokens,
    request: FastifyRequest,
    redirectBase: string,
  ): Promise<{ redirectUrl: string; refreshToken: string }> {
    this.logger.warn(
      `Unverified OAuth email collision for ${profile.provider} → existing user ${existingUser.id}; requiring OTP`,
    );

    // Stash the pending link server-side WITHOUT writing to oauthProviders (verification gate)
    const tokenExpiresAt = tokens.expiresIn ? new Date(Date.now() + tokens.expiresIn * 1000) : null;
    const expiresAt = new Date(Date.now() + this.PENDING_LINK_EXPIRY_MINUTES * 60 * 1000);
    await this.oauthPendingLinkRepository.createForUser({
      userId: existingUser.id,
      provider: profile.provider,
      providerId: profile.providerId,
      email: existingUser.email,
      profilePictureUrl: profile.profilePictureUrl ?? null,
      accessToken: tokens.accessToken ?? null,
      refreshToken: tokens.refreshToken ?? null,
      tokenExpiresAt,
      expiresAt,
    });

    // Send the OTP to the account's real email — only the true owner can read it
    const { otp, expiresAt: otpExpiresAt } = await this.verificationService.createVerification(
      existingUser.id,
      VerificationChannelValues.EMAIL,
      existingUser.email,
    );
    this.emailService
      .sendVerificationEmail(existingUser.email, otp, otpExpiresAt, existingUser.displayName)
      .then(() => this.logger.log(`Sent OAuth link verification OTP to ${existingUser.email}`))
      .catch((sendError) => this.logger.error(`Failed to send OAuth link verification email: ${sendError.message}`));

    // Restricted session that authorizes exactly one action: verifying the email to commit the link
    await this.sessionService.deleteSessionsByType(existingUser.id, SessionTypeValues.OAUTH_VERIFY);
    const { refreshToken } = await this.sessionService.createSession(
      existingUser.id,
      SessionTypeValues.OAUTH_VERIFY,
      request,
    );

    const params = new URLSearchParams({
      email: existingUser.email,
      provider: profile.provider.toLowerCase(),
    });
    const redirectUrl = `${redirectBase}/oauth-verify-email?${params.toString()}`;

    return { redirectUrl, refreshToken };
  }

  // Resumes onboarding for an OAuth user who previously signed up but didn't finish
  private async handleExistingIncompleteUser(
    existingUser: User,
    profile: OAuthUserProfile,
    tokens: OAuthTokens,
    request: FastifyRequest,
    redirectBase: string,
  ): Promise<{ redirectUrl: string; refreshToken: string }> {
    this.logger.log(`Resuming onboarding for incomplete OAuth user: ${profile.email} (${existingUser.id})`);
    await this.sessionService.deleteOnboardingSessions(existingUser.id);
    return this.linkProviderAndCreateSession(
      existingUser,
      profile,
      tokens,
      SessionTypeValues.ONBOARDING,
      request,
      redirectBase,
      true,
    );
  }

  // Handles existing user with completed onboarding
  private async handleExistingCompleteUser(
    existingUser: User,
    profile: OAuthUserProfile,
    tokens: OAuthTokens,
    request: FastifyRequest,
    redirectBase: string,
  ): Promise<{ redirectUrl: string; refreshToken: string }> {
    // Admin subdomain requires admin privileges; the session type follows the initiating origin
    const isAdminLogin = this.isAdminOrigin(redirectBase);
    if (isAdminLogin && !existingUser.isAdmin) {
      throw new UnauthorizedException({
        label: 'Access Denied',
        detail: 'You do not have permission to access the admin portal.',
      });
    }
    const sessionType = isAdminLogin ? SessionTypeValues.ADMIN : SessionTypeValues.CLOUD;
    this.logger.log(`Found existing user for email: ${profile.email}, linking OAuth provider (${sessionType})`);
    return this.linkProviderAndCreateSession(existingUser, profile, tokens, sessionType, request, redirectBase);
  }

  // Handles the case when no user exists with the email
  private async handleNewUser(
    profile: OAuthUserProfile,
    tokens: OAuthTokens,
    request: FastifyRequest,
    redirectBase: string,
  ): Promise<{ redirectUrl: string; refreshToken: string }> {
    this.logger.log(`Creating new user from OAuth profile: ${profile.email} (verified: ${profile.emailVerified})`);
    const user = await this.userRepository.createFromOAuth({
      email: profile.email,
      fullName: profile.fullName,
      displayName: profile.displayName,
      emailVerified: profile.emailVerified,
      onboardingStep: profile.emailVerified
        ? OnboardingStepValues.SET_PASSWORD
        : OnboardingStepValues.EMAIL_VERIFICATION,
      profilePictureUrl: profile.profilePictureUrl,
      signupMethod: SignupMethodValues.OAUTH,
    });

    // Provider didn't verify the email — send an OTP so the user can verify on the onboarding page
    if (!profile.emailVerified) {
      const { otp, expiresAt } = await this.verificationService.createVerification(
        user.id,
        VerificationChannelValues.EMAIL,
        profile.email,
      );
      this.emailService
        .sendVerificationEmail(profile.email, otp, expiresAt, user.displayName)
        .then(() => this.logger.log(`Sent signup verification OTP to ${profile.email}`))
        .catch((sendError) => this.logger.error(`Failed to send signup verification email: ${sendError.message}`));
    }

    return this.linkProviderAndCreateSession(
      user,
      profile,
      tokens,
      SessionTypeValues.ONBOARDING,
      request,
      redirectBase,
    );
  }

  // Links OAuth provider, creates session, and builds response
  private async linkProviderAndCreateSession(
    user: User,
    profile: OAuthUserProfile,
    tokens: OAuthTokens,
    sessionType: SessionType,
    request: FastifyRequest,
    redirectBase: string,
    resume = false,
  ): Promise<{ redirectUrl: string; refreshToken: string }> {
    // Link OAuth provider to user
    const tokenExpiresAt = tokens.expiresIn ? new Date(Date.now() + tokens.expiresIn * 1000) : undefined;
    await this.oauthProviderRepository.upsert(
      user.id,
      profile,
      tokens.accessToken,
      tokens.refreshToken,
      tokenExpiresAt,
    );
    this.logger.log(`Linked OAuth provider: ${profile.provider} to user: ${user.id}`);

    // Create session
    const session = await this.sessionService.createSession(user.id, sessionType, request);

    // Build frontend redirect URL based on session type
    const isFullyOnboarded = sessionType === SessionTypeValues.CLOUD || sessionType === SessionTypeValues.ADMIN;
    const redirectUrl = isFullyOnboarded
      ? redirectBase // Complete users → dashboard
      : `${redirectBase}/auth-success?email=${encodeURIComponent(user.email)}${resume ? '&resume=true' : ''}`; // Incomplete users → auth-success

    this.logger.log(
      `OAuth callback completed for user: ${user.email}, sessionType: ${sessionType}, redirecting to: ${isFullyOnboarded ? 'dashboard' : 'auth-success'}`,
    );

    return { redirectUrl, refreshToken: session.refreshToken };
  }
}
