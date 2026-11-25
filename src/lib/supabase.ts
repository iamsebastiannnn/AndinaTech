import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { env, isSupabaseConfigured } from '@/config/env';

const isWeb = Platform.OS === 'web';

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabasePublishableKey, {
      auth: {
        ...(isWeb ? {} : { storage: AsyncStorage }),
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: isWeb,
      },
    })
  : null;

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super('Supabase no está configurado');
    this.name = 'SupabaseNotConfiguredError';
  }
}

export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new SupabaseNotConfiguredError();
  return supabase;
}

if (!isWeb && supabase) {
  const client = supabase;
  AppState.addEventListener('change', (state) => {
    if (state === 'active') client.auth.startAutoRefresh();
    else client.auth.stopAutoRefresh();
  });
}
