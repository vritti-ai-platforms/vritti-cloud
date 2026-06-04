import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UserDto } from '../dto/entity/user.dto';

export function ApiFindAllUsers() {
  return applyDecorators(
    ApiOperation({ summary: 'Retrieve all users (admin/internal use)' }),
    ApiResponse({
      status: 200,
      description: 'List of all users retrieved successfully',
      type: [UserDto],
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication' }),
  );
}

export function ApiFindUserById() {
  return applyDecorators(
    ApiOperation({ summary: 'Retrieve a user by ID' }),
    ApiParam({
      name: 'id',
      description: 'Unique identifier of the user',
      example: 'usr_abc123xyz',
    }),
    ApiResponse({
      status: 200,
      description: 'User retrieved successfully',
      type: UserDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}
