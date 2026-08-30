import type { AuthenticatedResponse, AuthUser } from '@/core/auth/auth.types';
import { useQueryClient } from '@tanstack/react-query';
import {
  clearSessionStorage,
  getAccessToken,
  getAuthUser,
  saveAuthUser,
  saveTokens,
  subscribeToSessionCleared,
} from '@/core/auth/auth.storage';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

type SessionContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  completeAuthentication: (response: AuthenticatedResponse) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeToSessionCleared(() => {
      if (!isMounted) return;
      queryClient.clear();
      setAccessToken(null);
      setUser(null);
    });

    Promise.all([getAccessToken(), getAuthUser()])
      .then(([storedAccessToken, storedUser]) => {
        if (!isMounted) return;
        setAccessToken(storedAccessToken);
        setUser(storedUser);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [queryClient]);

  const value = useMemo<SessionContextValue>(
    () => ({
      isAuthenticated: Boolean(accessToken),
      isLoading,
      user,
      completeAuthentication: async (response) => {
        queryClient.clear();
        await Promise.all([
          saveTokens(response.accessToken, response.refreshToken),
          saveAuthUser(response.user),
        ]);
        setAccessToken(response.accessToken);
        setUser(response.user);
      },
      signOut: async () => {
        await clearSessionStorage();
        queryClient.clear();
        setAccessToken(null);
        setUser(null);
      },
    }),
    [accessToken, isLoading, queryClient, user]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside SessionProvider');
  return context;
}
