import { useCallback, useRef, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { AppError } from '@/utils/errors';
import {
  normalizeColombianPhone,
  validateColombianPhone,
  validateEmail,
  validateFullName,
  validatePassword,
  validatePasswordConfirmation,
} from '@/utils/validation';

export interface RegisterValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmation: string;
}

export type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

const EMPTY: RegisterValues = { fullName: '', email: '', phone: '', password: '', confirmation: '' };

function validate(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};
  const checks: [keyof RegisterValues, string | null][] = [
    ['fullName', validateFullName(values.fullName)],
    ['email', validateEmail(values.email)],
    ['phone', validateColombianPhone(values.phone)],
    ['password', validatePassword(values.password)],
    ['confirmation', validatePasswordConfirmation(values.password, values.confirmation)],
  ];
  for (const [field, message] of checks) if (message) errors[field] = message;
  return errors;
}

export function useRegisterForm() {
  const { signUp } = useAuth();
  const [values, setValues] = useState<RegisterValues>(EMPTY);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<'signed-in' | 'confirm-email' | null>(null);
  const submitting = useRef(false);

  const setField = useCallback((field: keyof RegisterValues, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => (previous[field] ? { ...previous, [field]: undefined } : previous));
  }, []);

  const submit = useCallback(async () => {
    if (submitting.current) return;
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    submitting.current = true;
    setIsSubmitting(true);
    try {
      const result = await signUp({
        fullName: values.fullName.trim().replace(/\s+/g, ' '),
        email: values.email.trim().toLowerCase(),
        phone: normalizeColombianPhone(values.phone),
        password: values.password,
      });
      setOutcome(result.needsEmailConfirmation ? 'confirm-email' : 'signed-in');
    } catch (cause) {
      const error = cause instanceof AppError ? cause : new AppError('No pudimos crear la cuenta. Inténtalo de nuevo.');
      if (error.field) setErrors((previous) => ({ ...previous, [error.field!]: error.message }));
      else setFormError(error.message);
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }, [signUp, values]);

  return { values, errors, formError, isSubmitting, outcome, setField, submit };
}
