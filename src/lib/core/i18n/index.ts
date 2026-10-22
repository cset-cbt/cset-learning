import { derived, writable } from 'svelte/store';
import { messages, type Locale, type MessageKey } from './messages';

export type { Locale, MessageKey } from './messages';

export const LOCALE_COOKIE = 'cset-locale';
export const locale = writable<Locale>('vi');
export const t = derived(
  locale,
  ($locale) =>
    (key: MessageKey, params: Record<string, string | number> = {}) =>
      translate($locale, key, params)
);

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'vi' || value === 'en';
}

// Narrows an untrusted string (for example an action failure key) to a known message key.
export function isMessageKey(value: unknown): value is MessageKey {
  return typeof value === 'string' && Object.hasOwn(messages.vi, value);
}

export function translate(
  current: Locale,
  key: MessageKey,
  params: Record<string, string | number> = {}
): string {
  let value = messages[current][key] ?? messages.vi[key] ?? key;
  for (const [name, replacement] of Object.entries(params)) {
    value = value.replaceAll(`{${name}}`, String(replacement));
  }
  return value;
}

export function getLocale(cookies?: { get(name: string): string | undefined }): Locale {
  const value = cookies?.get(LOCALE_COOKIE);
  return isLocale(value) ? value : 'vi';
}

export function setLocale(next: Locale) {
  locale.set(next);
  if (typeof document === 'undefined') return;
  document.documentElement.lang = next;
  document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  try {
    localStorage.setItem(LOCALE_COOKIE, next);
  } catch {
    // Locale remains active for this page when storage is unavailable.
  }
}

export function initializeLocale(fallback: Locale = 'vi') {
  if (typeof window === 'undefined') return;
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(LOCALE_COOKIE);
  } catch {
    // Use the server-provided cookie fallback.
  }
  setLocale(isLocale(stored) ? stored : fallback);
}
