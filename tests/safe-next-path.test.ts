import { describe, expect, it } from 'vitest';
import { safeNextPath } from '../src/lib/core/auth/safe-next-path';

describe('safeNextPath', () => {
  it('keeps same-origin absolute paths, query strings included', () => {
    expect(safeNextPath('/courses')).toBe('/courses');
    expect(safeNextPath('/courses/x?y=1')).toBe('/courses/x?y=1');
  });

  it.each([
    ['protocol-relative', '//evil.com'],
    ['backslash host', '/\\evil.com'],
    ['absolute url', 'https://evil.com'],
    ['encoded protocol-relative', '/%2F%2Fevil.com'],
    ['newline injection', '/courses\nSet-Cookie: a=b'],
    ['carriage return', '/courses\r/x'],
    ['relative path', 'courses'],
    ['empty string', ''],
    ['malformed escape', '/%E0%A4%A']
  ])('falls back to /courses for %s', (_label, raw) => {
    expect(safeNextPath(raw)).toBe('/courses');
  });

  it('falls back for null and undefined', () => {
    expect(safeNextPath(null)).toBe('/courses');
    expect(safeNextPath(undefined)).toBe('/courses');
  });
});
