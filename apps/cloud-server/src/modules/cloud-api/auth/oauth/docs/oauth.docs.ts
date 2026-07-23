import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { OAuthVerifyEmailDto } from '../dto/request/oauth-verify-email.dto';
import { OAuthResendOtpResponseDto } from '../dto/response/oauth-resend-otp-response.dto';
import { OAuthVerifyEmailResponseDto } from '../dto/response/oauth-verify-email-response.dto';

export function ApiHandleOAuthCallback() {
  return applyDecorators(
    ApiOperation({
      summary: 'Handle OAuth callback',
      description:
        'Receives the authorization code from the OAuth provider after user authorization. Exchanges the code for tokens and creates a session.',
    }),
    ApiParam({
      name: 'provider',
      description: 'OAuth provider name',
      example: 'google',
      enum: ['google', 'github', 'microsoft'],
    }),
    ApiResponse({
      status: 302,
      description: 'Redirects to frontend with refresh cookie on success, or to error page on failure.',
    }),
    ApiResponse({
      status: 400,
      description: 'Missing or invalid code/state parameter.',
    }),
  );
}

export function ApiResendOAuthOtp() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Resend OAuth verification code',
      description:
        'Resends the email OTP for an in-flight OAuth email-collision link. Requires an OAUTH_VERIFY session and an unexpired pending link.',
    }),
    ApiResponse({
      status: 200,
      description: 'A new verification code was sent to the account email.',
      type: OAuthResendOtpResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Missing/invalid OAUTH_VERIFY session, or the pending link has expired.',
    }),
  );
}

export function ApiVerifyOAuthEmail() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Verify OAuth email and link provider',
      description:
        'Completes an OAuth login that collided with an existing account on an unverified email. Requires an OAUTH_VERIFY session. Validates the OTP sent to the account email, commits the pending provider link, and issues a full login session (refresh cookie set on success).',
    }),
    ApiBody({ type: OAuthVerifyEmailDto }),
    ApiResponse({
      status: 200,
      description: 'Email verified, provider linked, and login completed.',
      type: OAuthVerifyEmailResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid or expired verification code.',
    }),
    ApiResponse({
      status: 401,
      description: 'Missing/invalid OAUTH_VERIFY session, or the pending link has expired.',
    }),
  );
}

export function ApiInitiateOAuth() {
  return applyDecorators(
    ApiOperation({
      summary: 'Initiate OAuth flow',
      description:
        "Initiates the OAuth authentication flow by redirecting the user to the specified OAuth provider's authorization page.",
    }),
    ApiParam({
      name: 'provider',
      description: 'OAuth provider name',
      example: 'google',
      enum: ['google', 'github', 'microsoft'],
    }),
    ApiResponse({
      status: 302,
      description: 'Redirects to OAuth provider authorization page.',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid provider, or missing/untrusted origin.',
    }),
  );
}
