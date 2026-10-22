import { and, count, eq, inArray, sql } from 'drizzle-orm';
import type { SessionUser } from '$lib/core/auth/session-user';
import type { LearningDb } from '$lib/core/db/client';
import { NotFoundError, ValidationError } from '$lib/core/errors';
import { course, courseInstructor, courseItem, enrollment, itemProgress, user } from '$lib/core/db/schema';
import { resolveManagedCourse } from './item-access';

export interface CourseInstructorMember {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: 'owner' | 'lead' | 'instructor' | 'assistant';
  assignedAt: Date;
  isOwner: boolean;
}

export interface CourseStudentMember {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  enrolledAt: Date;
  completedItems: number;
  totalItems: number;
}

export async function listCourseMembers(
  db: LearningDb,
  actor: SessionUser,
  courseId: string
): Promise<{ instructors: CourseInstructorMember[]; students: CourseStudentMember[] }> {
  const managed = await resolveManagedCourse(db, actor, { courseId });

  // 1. Get Course Owner
  const [ownerUser] = await db
    .select({ id: user.id, name: user.name, email: user.email, image: user.image, createdAt: user.createdAt })
    .from(user)
    .where(eq(user.id, managed.ownerId))
    .limit(1);

  const instructors: CourseInstructorMember[] = [];
  if (ownerUser) {
    instructors.push({
      userId: ownerUser.id,
      name: ownerUser.name,
      email: ownerUser.email,
      image: ownerUser.image,
      role: 'owner',
      assignedAt: ownerUser.createdAt,
      isOwner: true
    });
  }

  // 2. Get assigned instructors
  const assigned = await db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: courseInstructor.role,
      assignedAt: courseInstructor.assignedAt
    })
    .from(courseInstructor)
    .innerJoin(user, eq(courseInstructor.userId, user.id))
    .where(eq(courseInstructor.courseId, courseId));

  for (const item of assigned) {
    if (item.userId !== managed.ownerId) {
      instructors.push({ ...item, isOwner: false });
    }
  }

  // 3. Count total course items
  const [totalRow] = await db
    .select({ total: count(courseItem.id) })
    .from(courseItem)
    .where(eq(courseItem.courseId, courseId));
  const totalItems = totalRow?.total ?? 0;

  // 4. Get enrolled students and completed items
  const studentRows = await db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      enrolledAt: enrollment.enrolledAt,
      completedItems: sql<number>`(
        SELECT COUNT(*) FROM item_progress ip
        INNER JOIN course_item ci ON ip.item_id = ci.id
        WHERE ip.user_id = ${user.id} AND ci.course_id = ${courseId}
      )`
    })
    .from(enrollment)
    .innerJoin(user, eq(enrollment.userId, user.id))
    .where(eq(enrollment.courseId, courseId))
    .orderBy(enrollment.enrolledAt);

  const students: CourseStudentMember[] = studentRows.map((row) => ({
    userId: row.userId,
    name: row.name,
    email: row.email,
    image: row.image,
    enrolledAt: row.enrolledAt,
    completedItems: Number(row.completedItems) || 0,
    totalItems
  }));

  return { instructors, students };
}

export async function listEligibleInstructors(db: LearningDb): Promise<Array<{ id: string; name: string; email: string }>> {
  return db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .where(inArray(user.role, ['instructor', 'admin']))
    .orderBy(user.name);
}

export async function assignCourseInstructor(
  db: LearningDb,
  actor: SessionUser,
  courseId: string,
  targetUserId: string,
  role: 'lead' | 'instructor' | 'assistant' = 'instructor'
): Promise<void> {
  const managed = await resolveManagedCourse(db, actor, { courseId });
  if (actor.role !== 'admin' && actor.id !== managed.ownerId) {
    throw new ValidationError('error.forbidden');
  }

  await db
    .insert(courseInstructor)
    .values({ courseId, userId: targetUserId, role, assignedAt: new Date() })
    .onConflictDoUpdate({
      target: [courseInstructor.courseId, courseInstructor.userId],
      set: { role, assignedAt: new Date() }
    });
}

export async function removeCourseInstructor(
  db: LearningDb,
  actor: SessionUser,
  courseId: string,
  targetUserId: string
): Promise<void> {
  const managed = await resolveManagedCourse(db, actor, { courseId });
  if (actor.role !== 'admin' && actor.id !== managed.ownerId) {
    throw new ValidationError('error.forbidden');
  }
  if (targetUserId === managed.ownerId) {
    throw new ValidationError('manage.error.cannotRemoveOwner');
  }

  await db
    .delete(courseInstructor)
    .where(and(eq(courseInstructor.courseId, courseId), eq(courseInstructor.userId, targetUserId)));
}

export async function enrollStudentsBatch(
  db: LearningDb,
  actor: SessionUser,
  courseId: string,
  userIds: string[]
): Promise<number> {
  await resolveManagedCourse(db, actor, { courseId });
  const uniqueIds = Array.from(new Set(userIds.filter((id) => typeof id === 'string' && id.trim().length > 0)));
  if (uniqueIds.length === 0) return 0;

  const now = new Date();
  const rows = uniqueIds.map((userId) => ({ userId, courseId, enrolledAt: now }));
  await db.insert(enrollment).values(rows).onConflictDoNothing();
  return uniqueIds.length;
}

export async function unenrollCourseStudent(
  db: LearningDb,
  actor: SessionUser,
  courseId: string,
  targetUserId: string
): Promise<void> {
  await resolveManagedCourse(db, actor, { courseId });
  await db.delete(enrollment).where(and(eq(enrollment.courseId, courseId), eq(enrollment.userId, targetUserId)));
}
