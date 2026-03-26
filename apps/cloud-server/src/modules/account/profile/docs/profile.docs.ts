import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { UserDto } from '../../../cloud-api/user/dto/entity/user.dto';
import { UpdateUserDto } from '../../../cloud-api/user/dto/request/update-user.dto';
import {
  IdentityVerificationStartDto,
  ResendTargetOtpDto,
  SubmitNewTargetDto,
  VerifyIdentityDto,
  VerifyNewTargetDto,
} from '../dto/request/contact-change.dto';

export function ApiGetProfile() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user profile',
      description: 'Returns the authenticated user profile information.',
    }),
    ApiResponse({ status: 200, description: 'Profile retrieved successfully', type: UserDto }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function ApiUpdateProfile() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update user profile',
      description:
        "Update the authenticated user's profile information including name, phone, profile picture, locale, and timezone.",
    }),
    ApiBody({ type: UpdateUserDto }),
    ApiResponse({ status: 200, description: 'Profile updated successfully', type: UserDto }),
    ApiResponse({ status: 400, description: 'Invalid input data' }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function ApiDeleteAccount() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete user account',
      description:
        "Soft delete the authenticated user's account. Sets account status to INACTIVE and invalidates all sessions.",
    }),
    ApiResponse({ status: 200, description: 'Account deleted successfully', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function ApiIdentityVerificationStart() {
  return applyDecorators(
    ApiOperation({
      summary: 'Start identity verification for contact change',
      description:
        'Sends a 6-digit OTP to the current email or phone to verify user identity before allowing a contact change.',
    }),
    ApiBody({ type: IdentityVerificationStartDto }),
    ApiResponse({
      status: 200,
      description: 'OTP sent successfully',
      schema: {
        type: 'object',
        properties: {
          expiresAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Contact not verified or other validation error' }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication' }),
  );
}

export function ApiVerifyIdentity() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verify identity OTP',
      description: 'Verifies the OTP sent to the current email or phone to confirm user identity.',
    }),
    ApiBody({ type: VerifyIdentityDto }),
    ApiResponse({ status: 200, description: 'Identity verified successfully', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Invalid or expired OTP' }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication' }),
  );
}

export function ApiSubmitNewTarget() {
  return applyDecorators(
    ApiOperation({
      summary: 'Submit new email or phone',
      description:
        'Validates the new email or phone, checks if already in use, and sends a verification OTP to the new target.',
    }),
    ApiBody({ type: SubmitNewTargetDto }),
    ApiResponse({
      status: 200,
      description: 'New target submitted, OTP sent',
      schema: {
        type: 'object',
        properties: {
          expiresAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Target already in use or identity not verified' }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication' }),
  );
}

export function ApiVerifyNewTarget() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verify new target OTP and complete change',
      description:
        'Verifies the OTP sent to the new email or phone and updates the user contact information.',
    }),
    ApiBody({ type: VerifyNewTargetDto }),
    ApiResponse({ status: 200, description: 'Contact changed successfully', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'Invalid or expired OTP' }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication' }),
  );
}

export function ApiResendTargetOtp() {
  return applyDecorators(
    ApiOperation({
      summary: 'Resend verification OTP',
      description: 'Resends the verification OTP to the active target (email or phone).',
    }),
    ApiBody({ type: ResendTargetOtpDto }),
    ApiResponse({ status: 200, description: 'OTP resent successfully', type: SuccessResponseDto }),
    ApiResponse({ status: 400, description: 'No active verification found' }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication' }),
  );
}
