import { describe, expect, it } from 'vitest';
import { slugify } from '../src/lib/features/courses/server/slug';

describe('slugify', () => {
  it('normalizes Vietnamese accents and stroked d', () => {
    expect(slugify('Lập trình Python cơ bản')).toBe('lap-trinh-python-co-ban');
    expect(slugify('Đại số 10')).toBe('dai-so-10');
  });

  it('uses a stable fallback for titles without letters or digits', () => {
    expect(slugify('!!!')).toBe('course');
  });

  it('limits long slugs without leaving a trailing separator', () => {
    const slug = slugify('a'.repeat(200));
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug.endsWith('-')).toBe(false);
  });
});
