import type { AuthStatusResponse } from '@services/user.service';
import { useQueryClient } from '@tanstack/react-query';
import { clearToken, scheduleTokenRefresh, setToken } from '@vritti/quantum-ui/axios';
import { useSSE } from '@vritti/quantum-ui/hooks';
import { useEffect, useState } from 'react';

type AuthEvents = {
  'auth-state': AuthStatusResponse;
  'session-revoked': Record<string, never>;
};

// Streams auth status via SSE — replaces one-shot query + separate session events
export function useAuthStatusStream(enabled = true) {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { eventType, data, isConnected } = useSSE<AuthEvents>({
    path: '/auth/status',
    events: ['auth-state', 'session-revoked'],
    enabled,
  });

  useEffect(() => {
    if (!eventType || !data) return;

    if (eventType === 'auth-state') {
      const response = data as AuthStatusResponse;
      setAuthState(response);
      setIsLoading(false);
      if (response.isAuthenticated && response.accessToken && response.expiresIn) {
        setToken(response.accessToken);
        scheduleTokenRefresh(response.expiresIn);
      }
    }

    if (eventType === 'session-revoked') {
      clearToken();
      queryClient.clear();
      window.location.href = '/login';
    }
  }, [eventType, data, queryClient]);

  return { authResponse: authState, isLoading, isConnected };
}
