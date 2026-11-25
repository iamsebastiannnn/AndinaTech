import { Redirect, useRouter } from 'expo-router';
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
import { usePageTitle } from '@/hooks/usePageTitle';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { spacing } from '@/theme';
import { PASSWORD_MIN_LENGTH } from '@/utils/validation';

export default function RegisterScreen() {
  usePageTitle('Registro');
  const router = useRouter();
  const { status } = useAuth();
  const form = useRegisterForm();
  const emailRef = useRef<TextFieldRef>(null);
  const phoneRef = useRef<TextFieldRef>(null);
  const passwordRef = useRef<TextFieldRef>(null);
  const confirmationRef = useRef<TextFieldRef>(null);

  if (status === 'loading') return <ViewLoader label="Comprobando tu sesión…" />;
  if (status === 'authenticated') return <Redirect href="/users" />;

  if (form.outcome === 'confirm-email') {
    return (
      <AuthCard
        icon="mail-unread-outline"
        title="Revisa tu correo"
        subtitle="Tu cuenta fue creada. Falta un paso para activarla."
      >
        <Notice
          tone="success"
          message={`Enviamos un enlace de confirmación a ${form.values.email.trim().toLowerCase()}. Ábrelo desde tu correo (revisa también la carpeta de spam) y después inicia sesión.`}
        />
        <Button label="Ir a iniciar sesión" icon="log-in-outline" onPress={() => router.replace('/login')} />
      </AuthCard>
    );
  }

  const disabled = form.isSubmitting;

  return (
    <AuthCard
      icon="person-add-outline"
      title="Crear cuenta"
      subtitle="Regístrate para acceder al directorio de usuarios."
    >
      <View style={styles.fields}>
        {form.formError ? <Notice tone="error" message={form.formError} /> : null}
        <TextField
          label="Nombre completo"
          icon="person-outline"
          value={form.values.fullName}
          onChangeText={(value) => form.setField('fullName', value)}
          error={form.errors.fullName}
          placeholder="Ej.: Laura Gómez Ríos"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          editable={!disabled}
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <TextField
          ref={emailRef}
          label="Correo electrónico"
          icon="mail-outline"
          value={form.values.email}
          onChangeText={(value) => form.setField('email', value)}
          error={form.errors.email}
          placeholder="nombre@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          editable={!disabled}
          onSubmitEditing={() => phoneRef.current?.focus()}
        />
        <TextField
          ref={phoneRef}
          label="Teléfono"
          icon="call-outline"
          value={form.values.phone}
          onChangeText={(value) => form.setField('phone', value)}
          error={form.errors.phone}
          hint="Celular colombiano de 10 dígitos."
          placeholder="300 123 4567"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          maxLength={20}
          returnKeyType="next"
          editable={!disabled}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <TextField
          ref={passwordRef}
          label="Contraseña"
          icon="lock-closed-outline"
          password
          value={form.values.password}
          onChangeText={(value) => form.setField('password', value)}
          error={form.errors.password}
          hint={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres.`}
          placeholder="Crea una contraseña"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          editable={!disabled}
          onSubmitEditing={() => confirmationRef.current?.focus()}
        />
        <TextField
          ref={confirmationRef}
          label="Confirmar contraseña"
          icon="lock-closed-outline"
          password
          value={form.values.confirmation}
          onChangeText={(value) => form.setField('confirmation', value)}
          error={form.errors.confirmation}
          placeholder="Repite la contraseña"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          editable={!disabled}
          onSubmitEditing={form.submit}
        />
      </View>
      <Button
        label={form.isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        icon="person-add-outline"
        variant="accent"
        onPress={form.submit}
        loading={form.isSubmitting}
      />
      <SocialSignIn mode="register" disabled={form.isSubmitting} />
      <AuthSwitchLink question="¿Ya tienes cuenta?" linkLabel="Inicia sesión" href="/login" />
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.md },
});
