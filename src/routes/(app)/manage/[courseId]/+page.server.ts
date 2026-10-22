import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { requireStaff } from '$lib/core/auth/guards';
import { actionFailure, ValidationError } from '$lib/core/errors';
import { deleteCourse, getManageableCourse, setCourseStatus, updateCourse } from '$lib/features/courses/server/course-service';
import {
  addItem, addSection, deleteItem, deleteSection, getOutline,
  moveItem, moveSection, renameItem, renameSection
} from '$lib/features/courses/server/outline-service';
import { listCourseMembers, listEligibleInstructors } from '$lib/features/courses/server/course-members-service';
import {
  handleAssignInstructor, handleEnrollStudents, handleRemoveInstructor, handleUnenrollStudent
} from '$lib/features/courses/server/manage-course-handlers';
import {
  addItemSchema, courseFieldsSchema, courseStatusSchema, itemTitleSchema,
  moveSchema, sectionTitleSchema, uuidSchema
} from '$lib/features/courses/validation';
import { rethrowRouteError } from '$lib/features/courses/server/route-errors';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
  const actor = requireStaff(locals, url);
  try {
    const [course, sections, members, eligibleInstructors] = await Promise.all([
      getManageableCourse(locals.runtime.db, actor, params.courseId),
      getOutline(locals.runtime.db, params.courseId),
      listCourseMembers(locals.runtime.db, actor, params.courseId),
      listEligibleInstructors(locals.runtime.db)
    ]);
    const isOwnerOrAdmin = actor.role === 'admin' || course.ownerId === actor.id;
    return { course, sections, members, eligibleInstructors, isOwnerOrAdmin };
  } catch (cause) {
    rethrowRouteError(cause);
  }
};

function uuidFromForm(form: FormData, key: string): string {
  const parsed = uuidSchema.safeParse(form.get(key));
  if (!parsed.success) throw new ValidationError('manage.error.invalidInput');
  return parsed.data;
}

export const actions: Actions = {
  updateCourse: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await event.request.formData();
      const parsed = courseFieldsSchema.safeParse({
        title: form.get('title'),
        summary: form.get('summary'),
        slug: form.get('slug'),
        coverImageUrl: form.get('coverImageUrl') || null
      });
      if (!parsed.success) throw new ValidationError('manage.error.invalidInput');
      await updateCourse(event.locals.runtime.db, actor, event.params.courseId, parsed.data);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  setStatus: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await event.request.formData();
      const parsed = courseStatusSchema.safeParse({ status: form.get('status') });
      if (!parsed.success) throw new ValidationError('manage.error.invalidInput');
      await setCourseStatus(event.locals.runtime.db, actor, event.params.courseId, parsed.data.status);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  deleteCourse: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      await deleteCourse(event.locals.runtime.db, event.locals.runtime.files, actor, event.params.courseId);
      redirect(303, resolve('/manage'));
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  addSection: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await event.request.formData();
      const parsed = sectionTitleSchema.safeParse({ title: form.get('title') });
      if (!parsed.success) throw new ValidationError('manage.error.invalidInput');
      await addSection(event.locals.runtime.db, actor, event.params.courseId, parsed.data.title);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  renameSection: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await event.request.formData();
      const sectionId = uuidFromForm(form, 'sectionId');
      const parsed = sectionTitleSchema.safeParse({ title: form.get('title') });
      if (!parsed.success) throw new ValidationError('manage.error.invalidInput');
      await renameSection(event.locals.runtime.db, actor, sectionId, parsed.data.title);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  moveSection: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await event.request.formData();
      const sectionId = uuidFromForm(form, 'sectionId');
      const parsed = moveSchema.safeParse({ direction: form.get('direction') });
      if (!parsed.success) throw new ValidationError('manage.error.invalidInput');
      await moveSection(event.locals.runtime.db, actor, sectionId, parsed.data.direction);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  deleteSection: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await event.request.formData();
      await deleteSection(event.locals.runtime.db, event.locals.runtime.files, actor, uuidFromForm(form, 'sectionId'));
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  addItem: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await event.request.formData();
      const parsed = addItemSchema.safeParse({
        sectionId: form.get('sectionId'),
        type: form.get('type'),
        title: form.get('title')
      });
      if (!parsed.success) throw new ValidationError('manage.error.invalidInput');
      await addItem(event.locals.runtime.db, actor, parsed.data);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  renameItem: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await event.request.formData();
      const itemId = uuidFromForm(form, 'itemId');
      const parsed = itemTitleSchema.safeParse({ title: form.get('title') });
      if (!parsed.success) throw new ValidationError('manage.error.invalidInput');
      await renameItem(event.locals.runtime.db, actor, itemId, parsed.data.title);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  moveItem: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await event.request.formData();
      const itemId = uuidFromForm(form, 'itemId');
      const parsed = moveSchema.safeParse({ direction: form.get('direction') });
      if (!parsed.success) throw new ValidationError('manage.error.invalidInput');
      await moveItem(event.locals.runtime.db, actor, itemId, parsed.data.direction);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  deleteItem: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await event.request.formData();
      await deleteItem(event.locals.runtime.db, event.locals.runtime.files, actor, uuidFromForm(form, 'itemId'));
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  assignInstructor: handleAssignInstructor,
  removeInstructor: handleRemoveInstructor,
  enrollStudent: handleEnrollStudents,
  enrollStudents: handleEnrollStudents,
  unenrollStudent: handleUnenrollStudent
};
