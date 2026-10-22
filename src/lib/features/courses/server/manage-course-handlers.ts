import type { RequestEvent } from '@sveltejs/kit';
import { requireStaff } from '$lib/core/auth/guards';
import { actionFailure, ValidationError } from '$lib/core/errors';
import {
  assignCourseInstructor,
  enrollStudentsBatch,
  removeCourseInstructor,
  unenrollCourseStudent
} from './course-members-service';

export async function handleAssignInstructor(event: RequestEvent) {
  const actor = requireStaff(event.locals, event.url);
  try {
    const form = await event.request.formData();
    const targetUserId = form.get('targetUserId');
    const role = (form.get('role') as 'lead' | 'instructor' | 'assistant') || 'instructor';
    if (!targetUserId || typeof targetUserId !== 'string') {
      throw new ValidationError('manage.error.invalidInput');
    }
    await assignCourseInstructor(event.locals.runtime.db, actor, event.params.courseId!, targetUserId, role);
    return { ok: true };
  } catch (cause) {
    return actionFailure(cause);
  }
}

export async function handleRemoveInstructor(event: RequestEvent) {
  const actor = requireStaff(event.locals, event.url);
  try {
    const form = await event.request.formData();
    const targetUserId = form.get('targetUserId');
    if (!targetUserId || typeof targetUserId !== 'string') {
      throw new ValidationError('manage.error.invalidInput');
    }
    await removeCourseInstructor(event.locals.runtime.db, actor, event.params.courseId!, targetUserId);
    return { ok: true };
  } catch (cause) {
    return actionFailure(cause);
  }
}

export async function handleEnrollStudents(event: RequestEvent) {
  const actor = requireStaff(event.locals, event.url);
  try {
    const form = await event.request.formData();
    const rawIds = form.get('userIds');
    let ids: string[] = [];
    if (typeof rawIds === 'string' && rawIds.startsWith('[')) {
      try {
        const parsed = JSON.parse(rawIds);
        if (Array.isArray(parsed)) ids = parsed.filter((x) => typeof x === 'string');
      } catch {
        // ignore
      }
    } else {
      const all = form.getAll('userIds');
      ids = all.filter((x): x is string => typeof x === 'string');
    }
    if (ids.length === 0) {
      throw new ValidationError('manage.error.invalidInput');
    }
    await enrollStudentsBatch(event.locals.runtime.db, actor, event.params.courseId!, ids);
    return { ok: true };
  } catch (cause) {
    return actionFailure(cause);
  }
}

export async function handleUnenrollStudent(event: RequestEvent) {
  const actor = requireStaff(event.locals, event.url);
  try {
    const form = await event.request.formData();
    const targetUserId = form.get('targetUserId');
    if (!targetUserId || typeof targetUserId !== 'string') {
      throw new ValidationError('manage.error.invalidInput');
    }
    await unenrollCourseStudent(event.locals.runtime.db, actor, event.params.courseId!, targetUserId);
    return { ok: true };
  } catch (cause) {
    return actionFailure(cause);
  }
}
