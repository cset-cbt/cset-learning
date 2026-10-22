import { and, eq } from 'drizzle-orm';
import type { SessionUser } from '$lib/core/auth/session-user';
import type { LearningDb } from '$lib/core/db/client';
import { NotFoundError } from '$lib/core/errors';
import { canAccessItems, canManageCourse } from '$lib/core/policy/access-control';
import { course, courseItem, courseSection, enrollment } from '../schema';
import type { CourseStatus, ItemType } from '../shared/course-types';

// Shared by every domain (courses, lessons, quizzes, exercises): resolves an id to its course
// and applies the access policy in one place. Every failure is a NotFoundError so a caller can
// never learn whether somebody else's course, section or item exists.
export interface CourseRef {
  id: string;
  slug: string;
  title: string;
  status: CourseStatus;
  ownerId: string;
}

export interface ItemRef {
  id: string;
  courseId: string;
  sectionId: string;
  type: ItemType;
  title: string;
  position: number;
}

export type ManagedRef = { courseId: string } | { sectionId: string } | { itemId: string };

const courseColumns = {
  id: course.id,
  slug: course.slug,
  title: course.title,
  status: course.status,
  ownerId: course.ownerId
};

const itemColumns = {
  id: courseItem.id,
  courseId: courseItem.courseId,
  sectionId: courseItem.sectionId,
  type: courseItem.type,
  title: courseItem.title,
  position: courseItem.position
};

export async function resolveManagedCourse(
  db: LearningDb,
  user: SessionUser,
  ref: ManagedRef
): Promise<CourseRef> {
  let rows: CourseRef[];
  if ('courseId' in ref) {
    rows = await db.select(courseColumns).from(course).where(eq(course.id, ref.courseId)).limit(1);
  } else if ('sectionId' in ref) {
    rows = await db
      .select(courseColumns)
      .from(courseSection)
      .innerJoin(course, eq(courseSection.courseId, course.id))
      .where(eq(courseSection.id, ref.sectionId))
      .limit(1);
  } else {
    rows = await db
      .select(courseColumns)
      .from(courseItem)
      .innerJoin(course, eq(courseItem.courseId, course.id))
      .where(eq(courseItem.id, ref.itemId))
      .limit(1);
  }
  const found = rows[0];
  if (!found || !canManageCourse(user, found)) throw new NotFoundError();
  return found;
}

async function loadItemWithCourse(db: LearningDb, itemId: string) {
  const rows = await db
    .select({ item: itemColumns, course: courseColumns })
    .from(courseItem)
    .innerJoin(course, eq(courseItem.courseId, course.id))
    .where(eq(courseItem.id, itemId))
    .limit(1);
  return rows[0];
}

// Item editor access: the caller must manage the course. `courseId` (from the URL) must match.
export async function resolveManagedItem(
  db: LearningDb,
  user: SessionUser,
  itemId: string,
  courseId?: string
): Promise<{ item: ItemRef; course: CourseRef }> {
  const row = await loadItemWithCourse(db, itemId);
  if (!row || !canManageCourse(user, row.course)) throw new NotFoundError();
  if (courseId !== undefined && row.course.id !== courseId) throw new NotFoundError();
  return row;
}

export async function isEnrolled(
  db: LearningDb,
  userId: string,
  courseId: string
): Promise<boolean> {
  const rows = await db
    .select({ userId: enrollment.userId })
    .from(enrollment)
    .where(and(eq(enrollment.userId, userId), eq(enrollment.courseId, courseId)))
    .limit(1);
  return rows.length > 0;
}

// Learner access: owners and admins always; students need enrollment in a PUBLISHED course.
// `slug` (from the URL) must match the item's course.
export async function resolveLearnerItem(
  db: LearningDb,
  user: SessionUser,
  itemId: string,
  slug?: string
): Promise<{ item: ItemRef; course: CourseRef; enrolled: boolean }> {
  const row = await loadItemWithCourse(db, itemId);
  if (!row) throw new NotFoundError();
  if (slug !== undefined && row.course.slug !== slug) throw new NotFoundError();
  const enrolled = await isEnrolled(db, user.id, row.course.id);
  if (!canAccessItems(user, row.course, enrolled)) throw new NotFoundError();
  return { ...row, enrolled };
}
