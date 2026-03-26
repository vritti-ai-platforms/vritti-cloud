import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserDto } from '../../cloud-api/user/dto/entity/user.dto';
import { UpdateUserDto } from '../../cloud-api/user/dto/request/update-user.dto';

export function ApiGetProfile() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user profile',
      description: 'Returns the authenticated user profile information.',
    }),
    ApiResponse({
      status: 200,
      description: 'Profile retrieved successfully',
      type: UserDto,
    }),
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
    ApiResponse({
      status: 200,
      description: 'Profile updated successfully',
      type: UserDto,
    }),
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
    ApiResponse({
      status: 200,
      description: 'Account deleted successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Account successfully deleted' },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}
