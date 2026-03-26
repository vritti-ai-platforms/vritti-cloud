import { useEffect, useState } from 'react';

// Manages a countdown timer for OTP resend cooldown
export function useResendTimer(initial = 0) {
  const [timer, setTimer] = useState(initial);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const startTimer = (seconds = 45) => setTimer(seconds);

  return { timer, startTimer };
}
