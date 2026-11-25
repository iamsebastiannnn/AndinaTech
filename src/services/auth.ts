import type { Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { requireSupabase } from '@/lib/supabase';
import { AppError } from '@/utils/errors';

export interface SignUpInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface SignUpResult {
  session: Session | null;
  needsEmailConfirmation: boolean;
}

function getEmailRedirectUrl(): string | undefined {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/login`;
  }
  return undefined;
}

export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const { data, error } = await requireSupabase().auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { full_name: input.fullName, phone: input.phone },
      emailRedirectTo: getEmailRedirectUrl(),
    },
  });
  if (error) throw error;

  if (!data.session && data.user && (data.user.identities?.length ?? 0) === 0) {
    throw new AppError('Este correo ya está registrado. Inicia sesión o usa otro correo.', 'email');
  }

  return { session: data.session, needsEmailConfirmation: !data.session };
}

export async function signIn(email: string, password: string): Promise<Session> {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOut(): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) await client.auth.signOut({ scope: 'local' });
}
