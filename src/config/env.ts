const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://iplfoeryclygkkiokuoz.supabase.co').trim();
const supabasePublishableKey = (process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_0CoMeZWJr0YmlFBivvrMvg_asanD0o2').trim();

export const env = { supabaseUrl, supabasePublishableKey };

export const missingEnvVars: string[] = [
  !supabaseUrl && 'EXPO_PUBLIC_SUPABASE_URL',
  !supabasePublishableKey && 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
].filter((name): name is string => Boolean(name));

export const isSupabaseConfigured = missingEnvVars.length === 0;
