import { eq } from 'drizzle-orm';
import type { R2Bucket } from '@cloudflare/workers-types';
import type { SessionUser } from '$lib/core/auth/session-user';
import type { LearningDb } from '$lib/core/db/client';
import { ValidationError } from '$lib/core/errors';
import { course } from '$lib/core/db/schema';
import { resolveManagedCourse } from './item-access';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_COVER_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadCourseCover(
  db: LearningDb,
  files: R2Bucket,
  actor: SessionUser,
  courseId: string,
  file: File
): Promise<{ coverImageUrl: string }> {
  await resolveManagedCourse(db, actor, { courseId });

  if (!file || file.size === 0) {
    throw new ValidationError('account.error.noFileSelected');
  }
  if (file.size > MAX_COVER_BYTES) {
    throw new ValidationError('manage.cover.tooLarge');
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    throw new ValidationError('manage.cover.invalidFormat');
  }

  const r2Key = `course-covers/${courseId}.webp`;
  const buffer = await file.arrayBuffer();

  await files.put(r2Key, buffer, {
    httpMetadata: { contentType: file.type }
  });

  const coverImageUrl = `/api/courses/${courseId}/cover?v=${Date.now()}`;

  await db
    .update(course)
    .set({ coverImageUrl, updatedAt: new Date() })
    .where(eq(course.id, courseId));

  return { coverImageUrl };
}

export async function removeCourseCover(
  db: LearningDb,
  files: R2Bucket,
  actor: SessionUser,
  courseId: string
): Promise<void> {
  await resolveManagedCourse(db, actor, { courseId });

  const r2Key = `course-covers/${courseId}.webp`;
  try {
    await files.delete(r2Key);
  } catch {
    // Ignore if file did not exist in R2
  }

  await db
    .update(course)
    .set({ coverImageUrl: null, updatedAt: new Date() })
    .where(eq(course.id, courseId));
}
