import { z } from 'zod';

// OTP verification form validation
export const otpSchema = z.object({
  code: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
});

export type OTPFormData = z.infer<typeof otpSchema>;

// New email entry form validation
export const newEmailSchema = z.object({
  newEmail: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

export type NewEmailFormData = z.infer<typeof newEmailSchema>;

// New phone entry form validation
export const newPhoneSchema = z.object({
  newPhone: z.string().min(10, 'Please enter a valid phone number'),
  phoneCountry: z.string(),
});

export type NewPhoneFormData = z.infer<typeof newPhoneSchema>;
