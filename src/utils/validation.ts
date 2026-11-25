export const PASSWORD_MIN_LENGTH = 8;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateFullName(value: string): string | null {
  const name = value.trim();
  if (!name) return 'Escribe tu nombre completo.';
  if (name.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
  if (name.length > 120) return 'El nombre es demasiado largo.';
  if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(name)) return 'El nombre solo puede tener letras y espacios.';
  return null;
}

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Escribe tu correo electrónico.';
  if (!EMAIL_REGEX.test(email)) return 'Escribe un correo válido, por ejemplo nombre@correo.com.';
  return null;
}

export function normalizeColombianPhone(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('0057')) digits = digits.slice(4);
  else if (digits.length === 12 && digits.startsWith('57')) digits = digits.slice(2);
  return digits;
}

export function validateColombianPhone(value: string): string | null {
  if (!value.trim()) return 'Escribe tu número de teléfono.';
  if (/[^\d\s()+-]/.test(value)) return 'El teléfono solo puede tener números.';
  const digits = normalizeColombianPhone(value);
  if (digits.length !== 10) return 'El teléfono debe tener 10 dígitos, por ejemplo 300 123 4567.';
  if (!/^(3\d{9}|60[1-8]\d{7})$/.test(digits)) {
    return 'Escribe un celular colombiano (empieza por 3) o un fijo con indicativo (60X).';
  }
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Escribe una contraseña.';
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener mínimo ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  return null;
}

export function validatePasswordConfirmation(password: string, confirmation: string): string | null {
  if (!confirmation) return 'Confirma tu contraseña.';
  if (password !== confirmation) return 'Las contraseñas no coinciden.';
  return null;
}
