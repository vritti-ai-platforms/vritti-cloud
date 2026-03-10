import type {
  RequestChangeRequest,
  ResendOtpRequest,
  RevertChangeRequest,
  VerifyChangeRequest,
  VerifyIdentityRequest,
} from '@services/verification.service';
import { verificationService } from '@services/verification.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function usePhoneVerification() {
  const queryClient = useQueryClient();

  const requestIdentityVerification = useMutation({
    mutationFn: verificationService.requestPhoneIdentityVerification,
  });

  const verifyIdentity = useMutation({
    mutationFn: (data: VerifyIdentityRequest) => verificationService.verifyPhoneIdentity(data),
  });

  const requestChange = useMutation({
    mutationFn: (data: RequestChangeRequest) => verificationService.requestPhoneChange(data),
  });

  const verifyChange = useMutation({
    mutationFn: (data: VerifyChangeRequest) => verificationService.verifyPhoneChange(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const resendOtp = useMutation({
    mutationFn: (data: ResendOtpRequest) => verificationService.resendPhoneOtp(data),
  });

  const revert = useMutation({
    mutationFn: (data: RevertChangeRequest) => verificationService.revertPhoneChange(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    requestIdentityVerification,
    verifyIdentity,
    requestChange,
    verifyChange,
    resendOtp,
    revert,
  };
}
