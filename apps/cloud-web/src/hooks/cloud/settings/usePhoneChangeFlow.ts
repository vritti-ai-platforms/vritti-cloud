import { verificationService } from '@services/verification.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

export type PhoneChangeStep = 'identity' | 'newPhone' | 'verify' | 'success';

export interface PhoneChangeFlowState {
  step: PhoneChangeStep;
  currentPhone: string;
  currentCountry: string;
  newPhone: string;
  newPhoneCountry: string;
  identityVerificationId: string;
  changeRequestId: string;
  changeVerificationId: string;
  changeRequestsToday: number;
  revertToken: string;
  error: string | null;
}

export function usePhoneChangeFlow(currentPhone: string, currentCountry: string) {
  const queryClient = useQueryClient();

  const [state, setState] = useState<PhoneChangeFlowState>({
    step: 'identity',
    currentPhone,
    currentCountry,
    newPhone: '',
    newPhoneCountry: 'IN',
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
      verificationService.verifyPhoneIdentity({
        verificationId: state.identityVerificationId,
        otpCode: data.code,
      }),
    onMutate: () => clearError(),
    onSuccess: (response) => {
      setState((prev) => ({
        ...prev,
        changeRequestId: response.changeRequestId,
        changeRequestsToday: response.changeRequestsToday,
        step: 'newPhone',
      }));
    },
  });

  // Mutation: Request phone change (Step 3)
  // Phone is passed as-is in E.164 format from PhoneField (e.g. "+919876543210")
  const changePhoneMutation = useMutation({
    mutationFn: async (data: { newPhone: string; phoneCountry: string }) =>
      verificationService.requestPhoneChange({
        changeRequestId: state.changeRequestId,
        newPhone: data.newPhone,
        phoneCountry: data.phoneCountry,
      }),
    onMutate: () => clearError(),
    onSuccess: (response, variables) => {
      setState((prev) => ({
        ...prev,
        newPhone: variables.newPhone,
        newPhoneCountry: variables.phoneCountry,
        changeVerificationId: response.verificationId,
        step: 'verify',
      }));
      setResendTimer(45);
    },
  });

  // Mutation: Verify new phone OTP (Step 4)
  const verifyPhoneMutation = useMutation({
    mutationFn: async (data: { code: string }) =>
      verificationService.verifyPhoneChange({
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
      const response = await verificationService.requestPhoneIdentityVerification();
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
      await verificationService.resendPhoneOtp({ verificationId });
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
      step: prev.step === 'verify' ? 'newPhone' : prev.step === 'newPhone' ? 'identity' : prev.step,
    }));
  };

  // Reset flow
  const reset = useCallback(() => {
    setState({
      step: 'identity',
      currentPhone,
      currentCountry,
      newPhone: '',
      newPhoneCountry: 'IN',
      identityVerificationId: '',
      changeRequestId: '',
      changeVerificationId: '',
      changeRequestsToday: 0,
      revertToken: '',
      error: null,
    });
    setResendTimer(0);
  }, [currentPhone, currentCountry]);

  return {
    state,
    resendTimer,
    startFlow,
    identityMutation,
    changePhoneMutation,
    verifyPhoneMutation,
    handleResendOtp,
    goBack,
    reset,
    clearError,
  };
}
