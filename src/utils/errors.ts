interface ErrorLike {
  name?: string;
  message?: string;
  code?: string;
  status?: number;
}

export class AppError extends Error {
  field?: 'email' | 'password';

  constructor(message: string, field?: 'email' | 'password') {
    super(message);
    this.name = 'AppError';
    this.field = field;
  }
}

const OFFLINE_MESSAGE =
  'No pudimos conectarnos. Revisa tu conexión a internet e inténtalo de nuevo.';

function asErrorLike(error: unknown): ErrorLike {
  return typeof error === 'object' && error !== null ? (error as ErrorLike) : {};
}

export function isNetworkError(error: unknown): boolean {
  const { name = '', message = '', status } = asErrorLike(error);
  return (
    name === 'AuthRetryableFetchError' ||
    status === 0 ||
    /failed to fetch|network request failed|networkerror|load failed|fetch failed/i.test(message)
  );
}

export function toAuthError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (isNetworkError(error)) return new AppError(OFFLINE_MESSAGE);

  const { code = '', message = '', status, name } = asErrorLike(error);
  const text = message.toLowerCase();

  if (name === 'SupabaseNotConfiguredError') {
    return new AppError('La aplicación aún no está conectada a la base de datos.');
  }
  if (code === 'user_already_exists' || code === 'email_exists' || text.includes('already registered')) {
    return new AppError('Este correo ya está registrado. Inicia sesión o usa otro correo.', 'email');
  }
  if (code === 'weak_password' || text.includes('password should')) {
    return new AppError(
      'La contraseña es muy débil. Usa mínimo 8 caracteres y combina letras y números.',
      'password',
    );
  }
  if (code === 'invalid_credentials' || text.includes('invalid login credentials')) {
    return new AppError('Correo o contraseña incorrectos. Verifica los datos e inténtalo de nuevo.');
  }
  if (code === 'email_not_confirmed' || text.includes('email not confirmed')) {
    return new AppError(
      'Aún no has confirmado tu correo. Abre el enlace que te enviamos y vuelve a iniciar sesión.',
    );
  }
  if (code === 'email_address_invalid' || code === 'validation_failed' || text.includes('invalid email')) {
    return new AppError('El correo no es válido. Revísalo e inténtalo de nuevo.', 'email');
  }
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || status === 429) {
    return new AppError('Hiciste demasiados intentos. Espera un minuto e inténtalo de nuevo.');
  }
  if (code === 'signup_disabled') {
    return new AppError('El registro de usuarios está deshabilitado en este momento.');
  }
  if (code === 'user_banned') {
    return new AppError('Esta cuenta está suspendida. Comunícate con el administrador.');
  }
  return new AppError('No pudimos completar la solicitud. Inténtalo de nuevo en unos segundos.');
}

export function toDataErrorMessage(error: unknown, subject: string): string {
  if (isNetworkError(error)) return OFFLINE_MESSAGE;
  if (asErrorLike(error).name === 'SupabaseNotConfiguredError') {
    return 'La aplicación aún no está conectada a la base de datos.';
  }
  return `No pudimos cargar ${subject}. Inténtalo de nuevo en unos segundos.`;
}
