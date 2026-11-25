import { useCallback, useRef, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { AppError } from '@/utils/errors';
import { validateEmail } from '@/utils/validation';

interface LoginErrors {
  email?: string;
  password?: string;
}

export function useLoginForm() {
  const { signIn } = useAuth();
  const [email, setEmailValue] = useState('');
  const [password, setPasswordValue] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);

  const setEmail = useCallback((value: string) => {
    setEmailValue(value);
    setErrors((previous) => ({ ...previous, email: undefined }));
  }, []);

  const setPassword = useCallback((value: string) => {
    setPasswordValue(value);
    setErrors((previous) => ({ ...previous, password: undefined }));
  }, []);

  const submit = useCallback(async () => {
    if (submitting.current) return;
    const nextErrors: LoginErrors = {
      email: validateEmail(email) ?? undefined,
      password: password ? undefined : 'Escribe tu contraseña.',
    };
    setErrors(nextErrors);
    setFormError(null);
    if (nextErrors.email || nextErrors.password) return;

    submitting.current = true;
    setIsSubmitting(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (cause) {
      setFormError(cause instanceof AppError ? cause.message : 'No pudimos iniciar sesión. Inténtalo de nuevo.');
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }, [email, password, signIn]);

  return { email, password, errors, formError, isSubmitting, setEmail, setPassword, submit };
}
