import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Notice } from '@/components/ui/Notice';
import {
  fetchSocialProviders,
  readSocialErrorFromLocation,
  signInWithGoogle,
  type SocialProvider,
} from '@/services/oauth';
import { colors, layout, radius, spacing, typography } from '@/theme';
import { AppError, isNetworkError } from '@/utils/errors';

const GOOGLE_MARK = require('../../../assets/google.png');

interface SocialSignInProps {
  mode: 'login' | 'register';
  disabled?: boolean;
}

export function SocialSignIn({ mode, disabled = false }: SocialSignInProps) {
  const [providers, setProviders] = useState<SocialProvider[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(() => readSocialErrorFromLocation());
  const running = useRef(false);

  useEffect(() => {
    let isCurrent = true;
    fetchSocialProviders()
      .then((available) => {
        if (isCurrent) setProviders(available);
      })
      .catch(() => {
        if (isCurrent) setProviders([]);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  if (!providers.includes('google')) {
    return error ? <Notice tone="error" message={error} /> : null;
  }

  async function begin() {
    if (running.current || disabled) return;
    running.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result === 'redirecting') return;
      running.current = false;
      setBusy(false);
    } catch (cause) {
      running.current = false;
      setBusy(false);
      if (cause instanceof AppError) setError(cause.message);
      else if (isNetworkError(cause)) setError('No pudimos conectarnos. Revisa tu conexión a internet e inténtalo de nuevo.');
      else setError('No pudimos iniciar el acceso con Google. Inténtalo de nuevo.');
    }
  }

  const label = busy ? 'Redirigiendo a Google…' : 'Continuar con Google';

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>o continúa con</Text>
        <View style={styles.line} />
      </View>
      <Pressable
        onPress={begin}
        disabled={busy || disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: busy || disabled, busy }}
        style={({ pressed }) => [styles.button, pressed && styles.pressed, (busy || disabled) && styles.buttonBusy]}
      >
        {busy ? (
          <ActivityIndicator size="small" color={colors.textMuted} />
        ) : (
          <Image source={GOOGLE_MARK} style={styles.mark} contentFit="contain" />
        )}
        <Text style={styles.buttonText}>{label}</Text>
      </Pressable>
      {mode === 'register' ? (
        <Text style={styles.note}>
          Al continuar con Google creamos tu cuenta con el nombre y el correo de tu perfil de Google.
        </Text>
      ) : null}
      {error ? <Notice tone="error" message={error} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { ...typography.caption },
  button: {
    minHeight: layout.minTouchSize + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  buttonBusy: { opacity: 0.7 },
  pressed: { backgroundColor: colors.surfaceMuted },
  mark: { width: 20, height: 20 },
  buttonText: { fontSize: 15, fontWeight: '700', color: colors.text },
  note: { ...typography.small, textAlign: 'center' },
});
