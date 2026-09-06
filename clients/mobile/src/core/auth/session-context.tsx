import type { AuthenticatedResponse, AuthUser } from '@/core/auth/auth.types';
import { useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/core/http-clients/http-client';
import {
  clearSessionStorage,
  getAuthUser,
  getSessionCredentials,
  saveAuthUser,
  saveSessionCredentials,
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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeToSessionCleared(() => {
      if (!isMounted) return;
      queryClient.clear();
      setSessionId(null);
      setUser(null);
    });

    Promise.all([getSessionCredentials(), getAuthUser()])
      .then(([storedCredentials, storedUser]) => {
		if (!isMounted) return;
        setSessionId(storedCredentials?.sessionId ?? null);
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
      isAuthenticated: Boolean(sessionId),
      isLoading,
      user,
      completeAuthentication: async (response) => {
        queryClient.clear();
        await saveSessionCredentials(response.session.id, response.session.token);
        setSessionId(response.session.id);

        try {
          const { user: authenticatedUser } = await httpClient
            .get('users/me')
            .json<{ user: AuthUser }>();
          await saveAuthUser(authenticatedUser);
          setUser(authenticatedUser);
        } catch {
          setUser(null);
        }
      },
      signOut: async () => {
        try {
          await httpClient.post('authentication/logout');
        } finally {
          await clearSessionStorage();
        }
        queryClient.clear();
        setSessionId(null);
        setUser(null);
      },
    }),
    [sessionId, isLoading, queryClient, user]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside SessionProvider');
  return context;
}
