import { verificationService } from '@services/verification.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

export type EmailChangeStep = 'identity' | 'newEmail' | 'verify' | 'success';

export interface EmailChangeFlowState {
  step: EmailChangeStep;
  currentEmail: string;
  newEmail: string;
  identityVerificationId: string;
  changeRequestId: string;
  changeVerificationId: string;
  changeRequestsToday: number;
  revertToken: string;
  error: string | null;
}

export function useEmailChangeFlow(currentEmail: string) {
  const queryClient = useQueryClient();

  const [state, setState] = useState<EmailChangeFlowState>({
    step: 'identity',
    currentEmail,
    newEmail: '',
    identityVerificationId: '',
    changeRequestId: '',
    changeVerificationId: '',
    changeRequestsToday: 0,
    revertToken: '',
    error: null,
  });

  const [resendTimer, setResendTimer] = useState(0);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Mutation: Verify identity OTP (Step 2)
  const identityMutation = useMutation({
    mutationFn: async (data: { code: string }) =>
      verificationService.verifyEmailIdentity({
        verificationId: state.identityVerificationId,
        otpCode: data.code,
      }),
    onMutate: () => clearError(),
    onSuccess: (response) => {
      setState((prev) => ({
        ...prev,
        changeRequestId: response.changeRequestId,
        changeRequestsToday: response.changeRequestsToday,
        step: 'newEmail',
      }));
    },
  });

  // Mutation: Request email change (Step 3)
  const changeEmailMutation = useMutation({
    mutationFn: async (data: { newEmail: string }) =>
      verificationService.requestEmailChange({
        changeRequestId: state.changeRequestId,
        newEmail: data.newEmail,
      }),
    onMutate: () => clearError(),
    onSuccess: (response, variables) => {
      setState((prev) => ({
        ...prev,
        newEmail: variables.newEmail,
        changeVerificationId: response.verificationId,
        step: 'verify',
      }));
      setResendTimer(45);
    },
  });

  // Mutation: Verify new email OTP (Step 4)
  const verifyEmailMutation = useMutation({
    mutationFn: async (data: { code: string }) =>
      verificationService.verifyEmailChange({
        changeRequestId: state.changeRequestId,
        verificationId: state.changeVerificationId,
        otpCode: data.code,
      }),
    onMutate: () => clearError(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setState((prev) => ({
        ...prev,
        revertToken: response.revertToken,
        step: 'success',
      }));
    },
  });

  // Step 1: Request identity verification (not a form submission)
  const startFlow = useCallback(async () => {
    clearError();
    try {
      const response = await verificationService.requestEmailIdentityVerification();
      setState((prev) => ({
        ...prev,
        identityVerificationId: response.verificationId,
        step: 'identity',
      }));
      setResendTimer(45);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to send verification code',
      }));
    }
  }, [clearError]);

  // Resend OTP (not a form submission)
  const handleResendOtp = async () => {
    clearError();
    try {
      const verificationId = state.step === 'identity' ? state.identityVerificationId : state.changeVerificationId;
      await verificationService.resendEmailOtp({ verificationId });
      setResendTimer(45);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to resend code',
      }));
    }
  };

  // Go back one step
  const goBack = () => {
    clearError();
    setState((prev) => ({
      ...prev,
      step: prev.step === 'verify' ? 'newEmail' : prev.step === 'newEmail' ? 'identity' : prev.step,
    }));
  };

  // Reset flow
  const reset = useCallback(() => {
    setState({
      step: 'identity',
      currentEmail,
      newEmail: '',
      identityVerificationId: '',
      changeRequestId: '',
      changeVerificationId: '',
      changeRequestsToday: 0,
      revertToken: '',
      error: null,
    });
    setResendTimer(0);
  }, [currentEmail]);

  return {
    state,
    resendTimer,
    startFlow,
    identityMutation,
    changeEmailMutation,
    verifyEmailMutation,
    handleResendOtp,
    goBack,
    reset,
    clearError,
  };
}
