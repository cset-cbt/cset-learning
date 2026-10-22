import { and, count, desc, eq, sql } from 'drizzle-orm';
import type { SessionUser } from '$lib/core/auth/session-user';
import type { LearningDb } from '$lib/core/db/client';
import { NotFoundError } from '$lib/core/errors';
import { canManageCourse, canViewCourse } from '$lib/core/policy/access-control';
import { course, courseItem, enrollment, itemProgress } from '../schema';
import { getOutline } from './outline-service';
import { isEnrolled } from './item-access';

export interface CatalogCourse {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImageUrl: string | null;
  itemCount: number;
  completedCount: number;
  enrolled: boolean;
}

export async function listCatalog(db: LearningDb, userId: string): Promise<CatalogCourse[]> {
  const rows = await db
    .select({
      id: course.id,
      slug: course.slug,
      title: course.title,
      summary: course.summary,
      coverImageUrl: course.coverImageUrl,
      itemCount: count(courseItem.id),
      completedCount: count(itemProgress.itemId),
      enrolled: sql<number>`CASE WHEN COUNT(${enrollment.userId}) > 0 THEN 1 ELSE 0 END`
    })
    .from(course)
    .leftJoin(courseItem, eq(courseItem.courseId, course.id))
    .leftJoin(
      itemProgress,
      and(eq(itemProgress.itemId, courseItem.id), eq(itemProgress.userId, userId))
    )
    .leftJoin(enrollment, and(eq(enrollment.courseId, course.id), eq(enrollment.userId, userId)))
    .where(eq(course.status, 'published'))
    .groupBy(course.id)
    .orderBy(desc(course.updatedAt));
  return rows.map((row) => ({ ...row, enrolled: Boolean(row.enrolled) }));
}

export async function getCourseForLearner(db: LearningDb, actor: SessionUser, slug: string) {
  const rows = await db.select().from(course).where(eq(course.slug, slug)).limit(1);
  const found = rows[0];
  if (!found || !canViewCourse(actor, found)) throw new NotFoundError();
  const [enrolled, outline] = await Promise.all([
    isEnrolled(db, actor.id, found.id),
    getOutline(db, found.id)
  ]);
  return { course: found, enrolled, outline, canManage: canManageCourse(actor, found) };
}

export async function enroll(db: LearningDb, userId: string, courseId: string): Promise<void> {
  const rows = await db
    .select({ id: course.id })
    .from(course)
    .where(and(eq(course.id, courseId), eq(course.status, 'published')))
    .limit(1);
  if (!rows[0]) throw new NotFoundError();
  await db.insert(enrollment).values({ userId, courseId }).onConflictDoNothing();
}

export async function getCompletedItemIds(
  db: LearningDb,
  userId: string,
  courseId: string
): Promise<Set<string>> {
  const rows = await db
    .select({ itemId: itemProgress.itemId })
    .from(itemProgress)
    .innerJoin(courseItem, eq(itemProgress.itemId, courseItem.id))
    .where(sql`${itemProgress.userId} = ${userId} AND ${courseItem.courseId} = ${courseId}`);
  return new Set(rows.map((row) => row.itemId));
}
