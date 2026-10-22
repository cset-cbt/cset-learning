const FALLBACK = '/courses';

// Only same-origin absolute paths may be used as a post-login redirect target. Anything that a
// browser could interpret as another origin (`//host`, `/\host`, encoded variants) is rejected.
export function safeNextPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return FALLBACK;
  if (/[\\\r\n]/.test(raw)) return FALLBACK;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return FALLBACK;
  }
  if (!decoded.startsWith('/') || decoded.startsWith('//') || /[\\\r\n]/.test(decoded)) {
    return FALLBACK;
  }
  return raw;
}
