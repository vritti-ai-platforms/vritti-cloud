import type { PhoneValue } from '@vritti/quantum-ui/PhoneField';
import { z } from 'zod';

// Validation schema for profile update form
export const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  displayName: z.string().optional(),
  phone: z
    .string()
    .min(10, 'Please enter a valid phone number')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
  locale: z.string(),
  timezone: z.string(),
  profilePicture: z.any().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Validation schema for password change form
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

// Account status enumeration matching backend
export enum AccountStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

export interface ProfileData {
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  accountStatus: AccountStatus;
  phone: PhoneValue;
  phoneCountry: string;
  profilePictureUrl: string | null;
  mediaId: string | null;
  locale: string;
  timezone: string;
  createdAt: string;
  lastLoginAt: string | null;
}

