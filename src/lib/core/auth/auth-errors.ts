import type { MessageKey } from '$lib/core/i18n/messages';

export interface AuthClientError {
  code?: string;
  status?: number;
}

// Maps a Better Auth client error to an i18n key. Server text is never echoed to the user.
export function mapAuthError(error: AuthClientError): MessageKey {
  if (error.status === 429) return 'auth.error.tooMany';
  const code = error.code ?? '';
  if (code === 'INVALID_EMAIL_OR_PASSWORD' || code === 'INVALID_EMAIL') return 'auth.error.invalid';
  if (code.startsWith('USER_ALREADY_EXISTS')) return 'auth.error.exists';
  if (code === 'PASSWORD_TOO_SHORT' || code === 'PASSWORD_TOO_LONG') {
    return 'auth.error.passwordLength';
  }
  if (code === 'BANNED_USER') return 'auth.error.banned';
  if (code === 'INVALID_PASSWORD') return 'account.error.wrongPassword';
  return 'auth.error.generic';
}
