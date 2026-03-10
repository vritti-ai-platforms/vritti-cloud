import { getLocaleCodes } from '@utils/locales';
import { getTimezoneValues } from '@utils/timezones';
import { z } from 'zod';

/**
 * Validation schema for profile update form
 */
export const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  displayName: z.string().optional(),
  phone: z.string().optional(),
  locale: z.string().refine((val) => getLocaleCodes().includes(val), {
    message: 'Invalid locale code',
  }),
  timezone: z.string().refine((val) => getTimezoneValues().includes(val), {
    message: 'Invalid timezone',
  }),
  profilePictureUrl: z
    .string()
    .optional()
    .refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
      message: 'Please enter a valid URL',
    }),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * Validation schema for password change form
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Account status enumeration matching backend
 */
export enum AccountStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

/**
 * Profile data matching backend response
 */
export interface ProfileData {
  id: string;
  email: string;
  fullName?: string | null;
  displayName?: string | null;
  accountStatus: AccountStatus;
  phone?: string | null;
  phoneCountry?: string | null;
  profilePictureUrl?: string | null;
  locale: string;
  timezone: string;
  createdAt: string;
  lastLoginAt?: string | null;
}

/**
 * Profile update DTO for API requests
 */
export interface UpdateProfileDto {
  fullName?: string;
  displayName?: string;
  phone?: string;
  phoneCountry?: string;
  locale?: string;
  timezone?: string;
  profilePictureUrl?: string;
}

/**
 * Password change DTO for API requests
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/**
 * Session data from backend
 */
export interface Session {
  sessionId: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}
