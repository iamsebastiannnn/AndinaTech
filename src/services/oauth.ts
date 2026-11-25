import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { env } from '@/config/env';
import { requireSupabase } from '@/lib/supabase';
import { AppError } from '@/utils/errors';

export type SocialProvider = 'google';
export type SocialResult = 'redirecting' | 'signed-in' | 'cancelled';

const isWeb = Platform.OS === 'web';

if (isWeb) WebBrowser.maybeCompleteAuthSession();

export async function fetchSocialProviders(): Promise<SocialProvider[]> {
  if (!env.supabaseUrl || !env.supabasePublishableKey) return [];
  const response = await fetch(`${env.supabaseUrl}/auth/v1/settings`, {
    headers: { apikey: env.supabasePublishableKey, Accept: 'application/json' },
  });
  if (!response.ok) return [];
  const settings: unknown = await response.json();
  const external =
    settings && typeof settings === 'object' && 'external' in settings
      ? (settings as { external: Record<string, unknown> }).external
      : null;
  return external && external.google === true ? ['google'] : [];
}

function isTrustedAuthorizationUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const own = new URL(env.supabaseUrl);
    return url.host === own.host && url.pathname.startsWith('/auth/v1/authorize');
  } catch {
    return false;
  }
}

function readParams(url: string): URLSearchParams {
  const params = new URLSearchParams();
  const [beforeHash, hash = ''] = url.split('#');
  const query = beforeHash.split('?')[1] ?? '';
  for (const part of [query, hash]) {
    new URLSearchParams(part).forEach((value, key) => params.set(key, value));
  }
  return params;
}

export function describeSocialError(code: string | null, description: string | null): string {
  const text = `${code ?? ''} ${description ?? ''}`.toLowerCase();
  if (text.includes('access_denied') || text.includes('cancel')) {
    return 'Cancelaste el acceso con Google. Puedes intentarlo de nuevo cuando quieras.';
  }
  if (text.includes('signup') && text.includes('disabled')) {
    return 'El registro de usuarios está deshabilitado en este momento.';
  }
  return 'No pudimos completar el acceso con Google. Inténtalo de nuevo.';
}

export function readSocialErrorFromLocation(): string | null {
  if (!isWeb || typeof window === 'undefined') return null;
  const params = readParams(window.location.href);
  const code = params.get('error') ?? params.get('error_code');
  if (!code) return null;
  return describeSocialError(code, params.get('error_description'));
}

let lastHandledUrl: string | null = null;

type SocialErrorListener = (message: string) => void;
const errorListeners = new Set<SocialErrorListener>();

export function onSocialError(listener: SocialErrorListener): () => void {
  errorListeners.add(listener);
  return () => {
    errorListeners.delete(listener);
  };
}

function reportSocialError(cause: unknown) {
  const message =
    cause instanceof AppError ? cause.message : 'No pudimos completar el acceso con Google. Inténtalo de nuevo.';
  errorListeners.forEach((listener) => listener(message));
}

export function getReturnUrl(): string {
  return isWeb && typeof window !== 'undefined' ? `${window.location.origin}/login` : Linking.createURL('login');
}

export async function completeSignInFromUrl(url: string): Promise<boolean> {
  const params = readParams(url);
  const failure = params.get('error') ?? params.get('error_code');
  if (failure) throw new AppError(describeSocialError(failure, params.get('error_description')));

  const code = params.get('code');
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!code && !(accessToken && refreshToken)) return false;
  if (lastHandledUrl === url) return true;
  lastHandledUrl = url;

  const client = requireSupabase();
  if (code) {
    const exchange = await client.auth.exchangeCodeForSession(code);
    if (exchange.error) throw exchange.error;
  } else if (accessToken && refreshToken) {
    const session = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (session.error) throw session.error;
  }
  return true;
}

export function listenForSignInLinks(): () => void {
  if (isWeb) return () => {};
  const handle = (url: string | null) => {
    if (url) completeSignInFromUrl(url).catch(reportSocialError);
  };
  Linking.getInitialURL().then(handle).catch(() => {});
  const subscription = Linking.addEventListener('url', (event) => handle(event.url));
  return () => subscription.remove();
}

export async function signInWithGoogle(): Promise<SocialResult> {
  const client = requireSupabase();
  const queryParams = { prompt: 'select_account' };

  if (isWeb) {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login`, queryParams },
    });
    if (error) throw error;
    return 'redirecting';
  }

  const redirectTo = getReturnUrl();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, queryParams, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url || !isTrustedAuthorizationUrl(data.url)) {
    throw new AppError('No pudimos iniciar el acceso con Google. Inténtalo de nuevo.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') {
    const { data: current } = await client.auth.getSession();
    return current.session ? 'signed-in' : 'cancelled';
  }

  const completed = await completeSignInFromUrl(result.url);
  if (!completed) throw new AppError('No pudimos completar el acceso con Google. Inténtalo de nuevo.');
  return 'signed-in';
}
