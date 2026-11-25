import { Redirect } from 'expo-router';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthCard } from '@/components/auth/AuthCard';
import { AuthSwitchLink } from '@/components/auth/AuthSwitchLink';
import { SocialSignIn } from '@/components/auth/SocialSignIn';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { TextField, type TextFieldRef } from '@/components/ui/TextField';
import { ViewLoader } from '@/components/ui/ViewLoader';
import { useAuth } from '@/contexts/AuthContext';
import { useLoginForm } from '@/hooks/useLoginForm';
import { usePageTitle } from '@/hooks/usePageTitle';
import { spacing } from '@/theme';

export default function LoginScreen() {
  usePageTitle('Iniciar sesión');
  const { status } = useAuth();
  const form = useLoginForm();
  const passwordRef = useRef<TextFieldRef>(null);

  if (status === 'loading') return <ViewLoader label="Comprobando tu sesión…" />;
  if (status === 'authenticated') return <Redirect href="/users" />;

  return (
    <AuthCard
      icon="log-in-outline"
      title="Iniciar sesión"
      subtitle="Ingresa para consultar los usuarios registrados."
    >
      <View style={styles.fields}>
        {form.formError ? <Notice tone="error" message={form.formError} /> : null}
        <TextField
          label="Correo electrónico"
          icon="mail-outline"
          value={form.email}
          onChangeText={form.setEmail}
          error={form.errors.email}
          placeholder="nombre@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          editable={!form.isSubmitting}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <TextField
          ref={passwordRef}
          label="Contraseña"
          icon="lock-closed-outline"
          password
          value={form.password}
          onChangeText={form.setPassword}
          error={form.errors.password}
          placeholder="Tu contraseña"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          editable={!form.isSubmitting}
          onSubmitEditing={form.submit}
        />
      </View>
      <Button
        label={form.isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
        icon="log-in-outline"
        onPress={form.submit}
        loading={form.isSubmitting}
      />
      <SocialSignIn mode="login" disabled={form.isSubmitting} />
      <AuthSwitchLink question="¿Aún no tienes cuenta?" linkLabel="Regístrate" href="/register" />
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.md },
});
