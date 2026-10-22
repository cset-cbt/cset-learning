import { eq } from 'drizzle-orm';
import type { LearningDb } from '$lib/core/db/client';
import { ValidationError } from '$lib/core/errors';
import { course } from '../schema';

export function slugify(title: string): string {
  const slug = title
    .normalize('NFD')
    .replace(/[đĐ]/g, 'd')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return slug || 'course';
}

function randomSuffix(): string {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0].toString(36).padStart(7, '0').slice(-4);
}

export async function ensureUniqueSlug(db: LearningDb, base: string): Promise<string> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${randomSuffix()}`;
    const found = await db.select({ id: course.id }).from(course).where(eq(course.slug, candidate)).limit(1);
    if (found.length === 0) return candidate;
  }
  throw new ValidationError('manage.error.slugTaken');
}
