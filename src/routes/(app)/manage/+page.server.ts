import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { requireStaff } from '$lib/core/auth/guards';
import { actionFailure, ValidationError } from '$lib/core/errors';
import { createCourse, listManageableCourses } from '$lib/features/courses/server/course-service';
import { createCourseSchema } from '$lib/features/courses/validation';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  const actor = requireStaff(locals, url);
  return { courses: await listManageableCourses(locals.runtime.db, actor) };
};

export const actions: Actions = {
  create: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await event.request.formData();
      const parsed = createCourseSchema.safeParse({
        title: form.get('title'),
        summary: form.get('summary') ?? '',
        coverImageUrl: form.get('coverImageUrl') || null
      });
      if (!parsed.success) throw new ValidationError('manage.error.invalidInput');
      const courseId = await createCourse(event.locals.runtime.db, actor, parsed.data);
      redirect(303, resolve('/(app)/manage/[courseId]', { courseId }));
    } catch (cause) {
      return actionFailure(cause);
    }
  }
};
