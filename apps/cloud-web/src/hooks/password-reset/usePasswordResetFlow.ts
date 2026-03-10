import { useMutation } from '@tanstack/react-query';
import { scheduleTokenRefresh, setToken } from '@vritti/quantum-ui/axios';
import type { AxiosError } from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resendResetOtp, type SuccessResponse } from '../../services/auth.service';
import { useForgotPassword } from './useForgotPassword';
import { useResetPassword } from './useResetPassword';
import { useVerifyResetOtp } from './useVerifyResetOtp';

export type Step = 'email' | 'otp' | 'reset';

export function usePasswordResetFlow() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  // Step 1: Request password reset — stores RESET session token
  const forgotPasswordMutation = useForgotPassword({
    onSuccess: (response, emailValue) => {
      setEmail(emailValue);

      // Store RESET session token so subsequent requests send Bearer
      if (response.accessToken) {
        setToken(response.accessToken);
        if (response.expiresIn) {
          scheduleTokenRefresh(response.expiresIn);
        }
      }

      setStep('otp');
    },
  });

  // Resend OTP mutation — uses dedicated endpoint (requires Bearer)
  const resendOtpMutation = useMutation<SuccessResponse, AxiosError>({
    mutationFn: resendResetOtp,
  });

  // Step 2: Verify OTP
  const verifyOtpMutation = useVerifyResetOtp({
    onSuccess: () => {
      setStep('reset');
    },
  });

  // Step 3: Reset password — stores new session token and navigates
  const resetPasswordMutation = useResetPassword({
    onSuccess: (response) => {
      // Store new session tokens (CLOUD or ONBOARDING)
      setToken(response.accessToken);
      if (response.expiresIn) {
        scheduleTokenRefresh(response.expiresIn);
      }

      // Navigate based on session type
      if (response.sessionType === 'ONBOARDING') {
        // OnboardingRouter determines the correct step from backend status
        navigate('../onboarding', { replace: true });
      } else {
        // CLOUD session — full page reload to refresh auth state and routes
        window.location.href = '/';
      }
    },
  });

  const goBack = () => {
    if (step === 'otp') {
      setStep('email');
    }
  };

  return {
    // State
    step,
    email,
    // Mutations (for Form component integration)
    forgotPasswordMutation,
    verifyOtpMutation,
    resetPasswordMutation,
    resendOtpMutation,
    // Actions
    goBack,
  };
}

export type PasswordResetFlow = ReturnType<typeof usePasswordResetFlow>;
