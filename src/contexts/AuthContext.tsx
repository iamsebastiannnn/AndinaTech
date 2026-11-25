import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';
import * as authService from '@/services/auth';
import { listenForSignInLinks } from '@/services/oauth';
import type { AuthStatus, SessionUser } from '@/types';
import { toAuthError } from '@/utils/errors';

interface AuthContextValue {
  status: AuthStatus;
  user: SessionUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: authService.SignUpInput) => Promise<authService.SignUpResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toSessionUser(session: Session | null): SessionUser | null {
  if (!session?.user) return null;
  const { id, email, user_metadata: metadata } = session.user;
  const fullName = typeof metadata?.full_name === 'string' ? metadata.full_name.trim() : '';
  return {
    id,
    email: email ?? '',
    fullName: fullName || (email ?? 'Usuario').split('@')[0],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isRestoring, setIsRestoring] = useState(supabase !== null);

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsRestoring(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase) return;
    return listenForSignInLinks();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const nextSession = await authService.signIn(email, password);
      setSession(nextSession);
    } catch (error) {
      throw toAuthError(error);
    }
  }, []);

  const signUp = useCallback(async (input: authService.SignUpInput) => {
    try {
      const result = await authService.signUp(input);
      if (result.session) setSession(result.session);
      return result;
    } catch (error) {
      throw toAuthError(error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
    } finally {
      setSession(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = toSessionUser(session);
    const status: AuthStatus = isRestoring ? 'loading' : user ? 'authenticated' : 'unauthenticated';
    return { status, user, signIn, signUp, signOut };
  }, [session, isRestoring, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
}
