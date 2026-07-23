import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Redirect,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CookieName,
  type CookieSerializeOptions,
  Public,
  RefreshCookieOptions,
  RequireSession,
  Subdomain,
  UserId,
} from '@vritti/api-sdk/auth';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { SessionTypeValues } from '@/db/schema';
import { ApiHandleOAuthCallback, ApiInitiateOAuth, ApiResendOAuthOtp, ApiVerifyOAuthEmail } from '../docs/oauth.docs';
import { OAuthCallbackQueryDto } from '../dto/request/oauth-callback-query.dto';
import { OAuthInitiateQueryDto } from '../dto/request/oauth-initiate-query.dto';
import { OAuthVerifyEmailDto } from '../dto/request/oauth-verify-email.dto';
import { OAuthResendOtpResponseDto } from '../dto/response/oauth-resend-otp-response.dto';
import { OAuthVerifyEmailResponseDto } from '../dto/response/oauth-verify-email-response.dto';
import { OAuthService } from '../services/oauth.service';

@ApiTags('OAuth')
@Controller('auth/oauth')
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);

  constructor(private readonly oauthService: OAuthService) {}

  // Initiates the OAuth authorization flow by redirecting to the provider
  @Get(':provider')
  @Public()
  @Redirect()
  @ApiInitiateOAuth()
  async initiateOAuth(
    @Param('provider') provider: string,
    @Query() query: OAuthInitiateQueryDto,
  ): Promise<{ url: string }> {
    this.logger.log(`GET /auth/oauth/${provider}`);
    return this.oauthService.initiateOAuth(provider, query.origin);
  }

  // Handles the OAuth provider callback, sets refresh cookie, and redirects to frontend
  @Get(':provider/callback')
  @Public()
  @ApiHandleOAuthCallback()
  async handleOAuthCallback(
    @Param('provider') provider: string,
    @Query() dto: OAuthCallbackQueryDto,
    @CookieName() cookieName: string,
    @RefreshCookieOptions() cookieOptions: CookieSerializeOptions,
    @Res() res: FastifyReply,
    @Req() request: FastifyRequest,
  ): Promise<void> {
    this.logger.log(`OAuth callback for: ${provider}`);

    // Map Facebook-specific error params to standard OAuth params
    const error = dto.error || dto.error_code;
    const errorDescription = dto.error_description || dto.error_reason;

    const { redirectUrl, refreshToken } = await this.oauthService.handleCallback(
      provider,
      dto.code,
      dto.state,
      request,
      error,
      errorDescription,
    );

    // Set refresh token cookie only on success — host-bound (via x-forwarded-host) to the initiating subdomain
    if (refreshToken) {
      res.setCookie(cookieName, refreshToken, cookieOptions);
    }

    res.redirect(redirectUrl, 302);
  }

  // Verifies the OTP for an unverified-email collision, commits the pending link, and completes login
  @Post('verify-email')
  @RequireSession(SessionTypeValues.OAUTH_VERIFY)
  @HttpCode(HttpStatus.OK)
  @ApiVerifyOAuthEmail()
  async verifyEmail(
    @UserId() userId: string,
    @Body() dto: OAuthVerifyEmailDto,
    @Subdomain() subdomain: string | undefined,
    @CookieName() cookieName: string,
    @RefreshCookieOptions() cookieOptions: CookieSerializeOptions,
    @Res({ passthrough: true }) res: FastifyReply,
    @Req() request: FastifyRequest,
  ): Promise<OAuthVerifyEmailResponseDto> {
    this.logger.log(`POST /auth/oauth/verify-email - User: ${userId}`);
    const { refreshToken, ...response } = await this.oauthService.verifyEmailAndLink(
      userId,
      dto.code,
      subdomain,
      request,
    );

    // Set the full-session refresh token cookie on success
    res.setCookie(cookieName, refreshToken, cookieOptions);

    return new OAuthVerifyEmailResponseDto(response);
  }

  // Resends the OTP for an in-flight OAuth email-collision link
  @Post('resend-otp')
  @RequireSession(SessionTypeValues.OAUTH_VERIFY)
  @HttpCode(HttpStatus.OK)
  @ApiResendOAuthOtp()
  async resendOtp(@UserId() userId: string): Promise<OAuthResendOtpResponseDto> {
    this.logger.log(`POST /auth/oauth/resend-otp - User: ${userId}`);
    const response = await this.oauthService.resendVerificationOtp(userId);
    return new OAuthResendOtpResponseDto(response);
  }
}
