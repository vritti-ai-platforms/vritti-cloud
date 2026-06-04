import { useAuthStatusStream } from '@hooks/auth/useAuthStatusStream';
import type { User } from '@services/user.service';
import { useQueryClient } from '@tanstack/react-query';
import { clearToken } from '@vritti/quantum-ui/axios';
import { createContext, useCallback, useContext, useMemo } from 'react';

interface AuthContextValue {
  user: User | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: undefined,
  isLoading: true,
  isAuthenticated: false,
  logout: () => {},
});

// Provides auth state to the app via SSE stream from /auth/status
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { authResponse, isLoading } = useAuthStatusStream();

  // Caller should reload page to '/' after calling logout
  const logout = useCallback(() => {
    clearToken();
    queryClient.clear();
  }, [queryClient]);

  const isAuthenticated = authResponse?.isAuthenticated ?? false;
  const user = authResponse?.user;

  const contextValue = useMemo<AuthContextValue>(
    () => ({ user, isLoading, isAuthenticated, logout }),
    [user, isLoading, isAuthenticated, logout],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Hook to access auth state — must be used within AuthProvider
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
