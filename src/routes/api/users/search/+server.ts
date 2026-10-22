import { json, type RequestHandler } from '@sveltejs/kit';
import { and, asc, eq, inArray, like, or, sql } from 'drizzle-orm';
import { requireStaff } from '$lib/core/auth/guards';
import { course, courseInstructor, enrollment, user } from '$lib/core/db/schema';

export const GET: RequestHandler = async ({ locals, url }) => {
  requireStaff(locals, url);

  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const roleFilter = url.searchParams.get('role'); // 'instructor' | 'student'
  const courseId = url.searchParams.get('courseId');
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 15, 1), 50);

  const db = locals.runtime.db;

  const conditions = [];

  // Filter by query string on name or email
  if (q) {
    conditions.push(
      or(
        like(sql`LOWER(${user.name})`, `%${q}%`),
        like(sql`LOWER(${user.email})`, `%${q}%`)
      )
    );
  }

  // Filter by system role
  if (roleFilter === 'instructor') {
    conditions.push(inArray(user.role, ['instructor', 'admin']));
  }

  // Exclude users already associated with the course
  if (courseId) {
    if (roleFilter === 'instructor') {
      // Exclude current instructors and owner
      conditions.push(
        sql`${user.id} NOT IN (
          SELECT user_id FROM course_instructor WHERE course_id = ${courseId}
          UNION
          SELECT owner_id FROM course WHERE id = ${courseId}
        )`
      );
    } else {
      // Exclude already enrolled students
      conditions.push(
        sql`${user.id} NOT IN (
          SELECT user_id FROM enrollment WHERE course_id = ${courseId}
        )`
      );
    }
  }

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image
    })
    .from(user)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(user.name))
    .limit(limit);

  return json({ users: rows });
};
