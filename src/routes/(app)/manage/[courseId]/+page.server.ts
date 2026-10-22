import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { requireStaff } from '$lib/core/auth/guards';
import { actionFailure, ValidationError } from '$lib/core/errors';
import {
  deleteCourse,
  getManageableCourse,
  setCourseStatus,
  updateCourse
} from '$lib/features/courses/server/course-service';
import {
  addItem,
  addSection,
  deleteItem,
  deleteSection,
  getOutline,
  moveItem,
  moveSection,
  renameItem,
  renameSection
} from '$lib/features/courses/server/outline-service';
import {
  addItemSchema,
  courseFieldsSchema,
  courseStatusSchema,
  itemTitleSchema,
  moveSchema,
  sectionTitleSchema,
  uuidSchema
} from '$lib/features/courses/validation';
import { rethrowRouteError } from '$lib/features/courses/server/route-errors';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
  const actor = requireStaff(locals, url);
  try {
    const course = await getManageableCourse(locals.runtime.db, actor, params.courseId);
    return { course, sections: await getOutline(locals.runtime.db, course.id) };
  } catch (cause) {
    rethrowRouteError(cause);
  }
};

async function fields(event: Parameters<Actions['updateCourse']>[0]) {
  return event.request.formData();
}

export const actions: Actions = {
  updateCourse: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await fields(event);
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
      const form = await fields(event);
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
      const form = await fields(event);
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
      const form = await fields(event);
      const sectionId = uuidFromForm(form, 'sectionId');
      const title = sectionTitleSchema.safeParse({ title: form.get('title') });
      if (!title.success) throw new ValidationError('manage.error.invalidInput');
      await renameSection(event.locals.runtime.db, actor, sectionId, title.data.title);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  moveSection: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await fields(event);
      const sectionId = uuidFromForm(form, 'sectionId');
      const direction = moveSchema.safeParse({ direction: form.get('direction') });
      if (!direction.success) throw new ValidationError('manage.error.invalidInput');
      await moveSection(event.locals.runtime.db, actor, sectionId, direction.data.direction);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  deleteSection: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const id = uuidFromForm(await fields(event), 'sectionId');
      await deleteSection(event.locals.runtime.db, event.locals.runtime.files, actor, id);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  addItem: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await fields(event);
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
      const form = await fields(event);
      const itemId = uuidFromForm(form, 'itemId');
      const title = itemTitleSchema.safeParse({ title: form.get('title') });
      if (!title.success) throw new ValidationError('manage.error.invalidInput');
      await renameItem(event.locals.runtime.db, actor, itemId, title.data.title);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  moveItem: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await fields(event);
      const itemId = uuidFromForm(form, 'itemId');
      const direction = moveSchema.safeParse({ direction: form.get('direction') });
      if (!direction.success) throw new ValidationError('manage.error.invalidInput');
      await moveItem(event.locals.runtime.db, actor, itemId, direction.data.direction);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  deleteItem: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const id = uuidFromForm(await fields(event), 'itemId');
      await deleteItem(event.locals.runtime.db, event.locals.runtime.files, actor, id);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  }
};

function uuidFromForm(form: FormData, key: string): string {
  const parsed = uuidSchema.safeParse(form.get(key));
  if (!parsed.success) throw new ValidationError('manage.error.invalidInput');
  return parsed.data;
}

