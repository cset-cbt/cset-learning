import { desc, eq, sql } from 'drizzle-orm';
import type { R2Bucket } from '@cloudflare/workers-types';
import type { SessionUser } from '$lib/core/auth/session-user';
import type { LearningDb } from '$lib/core/db/client';
import { NotFoundError, ValidationError } from '$lib/core/errors';
import { attachment, course, courseItem, user } from '$lib/core/db/schema';
import { resolveManagedCourse } from './item-access';
import { ensureUniqueSlug, slugify } from './slug';

export interface ManageCourse {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImageUrl: string | null;
  status: 'draft' | 'published';
  ownerId: string;
  ownerName: string;
  updatedAt: Date;
}

export async function listManageableCourses(db: LearningDb, actor: SessionUser): Promise<ManageCourse[]> {
  const rows = await db
    .select({
      id: course.id,
      slug: course.slug,
      title: course.title,
      summary: course.summary,
      coverImageUrl: course.coverImageUrl,
      status: course.status,
      ownerId: course.ownerId,
      ownerName: user.name,
      updatedAt: course.updatedAt
    })
    .from(course)
    .innerJoin(user, eq(course.ownerId, user.id))
    .where(actor.role === 'admin' ? undefined : eq(course.ownerId, actor.id))
    .orderBy(desc(course.updatedAt));
  return rows;
}

export async function getManageableCourse(db: LearningDb, actor: SessionUser, courseId: string) {
  const managed = await resolveManagedCourse(db, actor, { courseId });
  const rows = await db.select().from(course).where(eq(course.id, managed.id)).limit(1);
  const found = rows[0];
  if (!found) throw new NotFoundError();
  return found;
}

export async function createCourse(
  db: LearningDb,
  actor: SessionUser,
  input: { title: string; summary: string; coverImageUrl?: string | null }
): Promise<string> {
  const base = slugify(input.title);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = await ensureUniqueSlug(db, base);
    try {
      const [created] = await db
        .insert(course)
        .values({
          slug,
          title: input.title,
          summary: input.summary,
          coverImageUrl: input.coverImageUrl ?? null,
          ownerId: actor.id
        })
        .returning({ id: course.id });
      return created.id;
    } catch (cause) {
      if (!(cause instanceof Error) || !cause.message.includes('UNIQUE constraint failed: course.slug')) {
        throw cause;
      }
    }
  }
  throw new ValidationError('manage.error.slugTaken');
}

export async function updateCourse(
  db: LearningDb,
  actor: SessionUser,
  courseId: string,
  input: { title: string; summary: string; slug: string; coverImageUrl?: string | null }
): Promise<void> {
  await resolveManagedCourse(db, actor, { courseId });
  try {
    await db.update(course).set({ ...input, updatedAt: new Date() }).where(eq(course.id, courseId));
  } catch (cause) {
    if (cause instanceof Error && cause.message.includes('UNIQUE constraint failed: course.slug')) {
      throw new ValidationError('manage.error.slugTaken');
    }
    throw cause;
  }
}

export async function getPublishBlockers(db: LearningDb, courseId: string): Promise<string[]> {
  const items = await db
    .select({
      type: courseItem.type,
      hasQuestions: sql<number>`EXISTS(SELECT 1 FROM quiz_question qq WHERE qq.item_id = ${courseItem.id})`,
      hasTests: sql<number>`EXISTS(SELECT 1 FROM exercise_test et WHERE et.item_id = ${courseItem.id})`
    })
    .from(courseItem)
    .where(eq(courseItem.courseId, courseId));
  if (items.length === 0) return ['manage.error.blocker.noItems'];
  const blockers = new Set<string>();
  for (const item of items) {
    if (item.type === 'quiz' && !item.hasQuestions) blockers.add('manage.error.blocker.emptyQuiz');
    if (item.type === 'exercise' && !item.hasTests) blockers.add('manage.error.blocker.emptyExercise');
  }
  return [...blockers];
}

export async function setCourseStatus(
  db: LearningDb,
  actor: SessionUser,
  courseId: string,
  status: 'draft' | 'published'
): Promise<void> {
  const managed = await resolveManagedCourse(db, actor, { courseId });
  if (status === 'published') {
    const blockers = await getPublishBlockers(db, courseId);
    if (blockers.length > 0) throw new ValidationError('manage.error.publishBlocked', blockers);
  }
  await db.update(course).set({ status, updatedAt: new Date() }).where(eq(course.id, managed.id));
}

export async function deleteCourse(
  db: LearningDb,
  files: R2Bucket,
  actor: SessionUser,
  courseId: string
): Promise<void> {
  const managed = await resolveManagedCourse(db, actor, { courseId });
  const keys = await db
    .select({ key: attachment.r2Key })
    .from(attachment)
    .innerJoin(courseItem, eq(attachment.itemId, courseItem.id))
    .where(eq(courseItem.courseId, managed.id));
  await deleteR2Objects(files, keys.map((row) => row.key));
  await db.delete(course).where(eq(course.id, managed.id));
}

export async function attachmentKeysForSection(db: LearningDb, sectionId: string): Promise<string[]> {
  const rows = await db
    .select({ key: attachment.r2Key })
    .from(attachment)
    .innerJoin(courseItem, eq(attachment.itemId, courseItem.id))
    .where(eq(courseItem.sectionId, sectionId));
  return rows.map((row) => row.key);
}

export async function deleteR2Objects(files: R2Bucket, keys: string[]): Promise<void> {
  for (let offset = 0; offset < keys.length; offset += 1000) {
    await files.delete(keys.slice(offset, offset + 1000));
  }
}
