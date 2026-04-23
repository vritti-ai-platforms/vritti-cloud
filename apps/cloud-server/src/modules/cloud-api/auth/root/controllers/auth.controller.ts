import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  type MessageEvent,
  Post,
  Req,
  Res,
  Sse,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  AccessToken,
  CookieDomain,
  CookieName,
  type CookieSerializeOptions,
  Public,
  RefreshCookieOptions,
  RefreshTokenCookie,
  RequireSession,
  Subdomain,
  UserId,
} from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { NEVER, type Observable, concat, merge, of } from 'rxjs';
import {
  ApiForgotPassword,
  ApiGetAccessToken,
  ApiGetAuthStatus,
  ApiLogin,
  ApiLogout,
  ApiRefreshTokens,
  ApiResendResetOtp,
  ApiResetPassword,
  ApiSignup,
  ApiVerifyResetOtp,
} from '../docs/auth.docs';
import { ForgotPasswordDto, ResetPasswordDto, VerifyResetOtpDto } from '../dto/request/forgot-password.dto';
import { LoginDto } from '../dto/request/login.dto';
import { SignupDto } from '../dto/request/signup.dto';
import type { ForgotPasswordResponseDto } from '../dto/response/forgot-password-response.dto';
import type { LoginResponse } from '../dto/response/login-response.dto';
import type { MessageResponse } from '../dto/response/message-response.dto';
import type { ResetPasswordResponseDto } from '../dto/response/reset-password-response.dto';
import type { SignupResponseDto } from '../dto/response/signup-response.dto';
import type { SuccessResponse } from '../dto/response/success-response.dto';
import type { TokenResponse } from '../dto/response/token-response.dto';
import { AuthService } from '../services/auth.service';
import { AuthStatusSseService } from '../services/auth-status-sse.service';
import { PasswordResetService } from '../services/password-reset.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
    private readonly authStatusSse: AuthStatusSseService,
  ) {}

  // Creates a new user account and initiates onboarding
  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiSignup()
  async signup(
    @Body() signupDto: SignupDto,
    @CookieName() cookieName: string,
    @RefreshCookieOptions() cookieOptions: CookieSerializeOptions,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Req() request: FastifyRequest,
  ): Promise<SignupResponseDto> {
    this.logger.log(`POST /auth/signup - Email: ${signupDto.email}`);

    const { refreshToken, ...response } = await this.authService.signup(signupDto, request);

    reply.setCookie(cookieName, refreshToken, cookieOptions);

    return response;
  }

  // Authenticates user credentials, returns access token or MFA challenge
  @Post('login')
  @Public()
  @ApiLogin()
  async login(
    @Body() loginDto: LoginDto,
    @Subdomain() subdomain: string | undefined,
    @CookieName() cookieName: string,
    @RefreshCookieOptions() cookieOptions: CookieSerializeOptions,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Req() request: FastifyRequest,
  ): Promise<LoginResponse> {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);

    const { refreshToken, ...response } = await this.authService.login(loginDto, subdomain, request);

    if (refreshToken) {
      reply.setCookie(cookieName, refreshToken, cookieOptions);
    }

    return response;
  }

  // Streams auth status and real-time updates via SSE
  @Sse('status')
  @Public()
  @ApiGetAuthStatus()
  async getAuthStatus(@RefreshTokenCookie() refreshToken: string | undefined): Promise<Observable<MessageEvent>> {
    this.logger.log('SSE /auth/status - Establishing auth status stream');

    const authResponse = await this.authService.getAuthStatus(refreshToken);

    // Not authenticated — send auth state and keep connection open (prevents reconnect loop)
    if (!authResponse.isAuthenticated || !authResponse.user) {
      const initial$ = of({ type: 'auth-state', data: JSON.stringify(authResponse) } as MessageEvent);
      return concat(initial$, NEVER);
    }

    // Register SSE connection for real-time updates, keyed by sessionId
    const userId = authResponse.user.id;
    const connection$ = this.authStatusSse.addConnection(userId, authResponse.sessionId as string);

    // Push initial auth state, then stream updates
    const initial$ = of({ type: 'auth-state', data: JSON.stringify(authResponse) } as MessageEvent);
    return merge(initial$, connection$.asObservable());
  }

  // Recovers session from httpOnly cookie without rotating the refresh token
  @Get('access-token')
  @Public()
  @ApiGetAccessToken()
  async getAccessToken(@RefreshTokenCookie() refreshToken: string | undefined): Promise<TokenResponse> {
    this.logger.log('GET /auth/access-token - Recovering session from cookie');
    return this.authService.getAccessToken(refreshToken);
  }

  // Rotates refresh token and issues a new access token
  @Post('refresh-tokens')
  @Public()
  @ApiRefreshTokens()
  async refreshTokens(
    @RefreshTokenCookie() refreshToken: string | undefined,
    @CookieName() cookieName: string,
    @RefreshCookieOptions() cookieOptions: CookieSerializeOptions,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<TokenResponse> {
    this.logger.log('POST /auth/refresh-tokens');

    const result = await this.authService.refreshTokens(refreshToken);

    reply.setCookie(cookieName, result.refreshToken, cookieOptions);

    return { accessToken: result.accessToken, expiresIn: result.expiresIn };
  }

  // Invalidates the current session and clears the refresh cookie
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
  @ApiLogout()
  async logout(
    @AccessToken() accessToken: string,
    @CookieName() cookieName: string,
    @CookieDomain() domain: string,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<MessageResponse> {
    await this.authService.logout(accessToken);
    reply.clearCookie(cookieName, { path: '/', domain });
    return { message: 'Successfully logged out' };
  }

  // Sends OTP and creates a RESET session
  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiForgotPassword()
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @CookieName() cookieName: string,
    @RefreshCookieOptions() cookieOptions: CookieSerializeOptions,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Req() request: FastifyRequest,
  ): Promise<ForgotPasswordResponseDto> {
    this.logger.log(`POST /auth/forgot-password - Email: ${dto.email}`);

    const { refreshToken, ...response } = await this.passwordResetService.requestPasswordReset(dto.email, request);

    if (refreshToken) {
      reply.setCookie(cookieName, refreshToken, cookieOptions);
    }

    return response;
  }

  // Resends OTP using the RESET session
  @Post('resend-reset-otp')
  @RequireSession(SessionTypeValues.RESET)
  @HttpCode(HttpStatus.OK)
  @ApiResendResetOtp()
  async resendResetOtp(@UserId() userId: string): Promise<SuccessResponse> {
    this.logger.log(`POST /auth/resend-reset-otp - User: ${userId}`);
    return this.passwordResetService.resendOtp(userId);
  }

  // Verifies OTP using the RESET session
  @Post('verify-reset-otp')
  @RequireSession(SessionTypeValues.RESET)
  @HttpCode(HttpStatus.OK)
  @ApiVerifyResetOtp()
  async verifyResetOtp(@UserId() userId: string, @Body() dto: VerifyResetOtpDto): Promise<SuccessResponse> {
    this.logger.log(`POST /auth/verify-reset-otp - User: ${userId}`);
    return this.passwordResetService.verifyResetOtp(userId, dto.otp);
  }

  // Resets password and creates a new session
  @Post('reset-password')
  @RequireSession(SessionTypeValues.RESET)
  @HttpCode(HttpStatus.OK)
  @ApiResetPassword()
  async resetPassword(
    @UserId() userId: string,
    @Body() dto: ResetPasswordDto,
    @CookieName() cookieName: string,
    @CookieDomain() domain: string,
    @RefreshCookieOptions() cookieOptions: CookieSerializeOptions,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Req() request: FastifyRequest,
  ): Promise<ResetPasswordResponseDto> {
    this.logger.log(`POST /auth/reset-password - User: ${userId}`);

    const { refreshToken, ...response } = await this.passwordResetService.resetPassword(
      userId,
      dto.newPassword,
      request,
    );

    reply.clearCookie(cookieName, { path: '/', domain });
    reply.setCookie(cookieName, refreshToken, cookieOptions);

    return response;
  }
}
