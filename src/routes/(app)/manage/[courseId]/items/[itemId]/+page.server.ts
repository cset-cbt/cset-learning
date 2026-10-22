import { requireStaff } from '$lib/core/auth/guards';
import { actionFailure, ValidationError } from '$lib/core/errors';
import { resolveManagedItem } from '$lib/features/courses/server/item-access';
import { rethrowRouteError } from '$lib/features/courses/server/route-errors';
import { renameItem } from '$lib/features/courses/server/outline-service';
import { itemTitleSchema } from '$lib/features/courses/validation';
import { deleteAttachment, loadLessonEditor, saveLesson, addAttachment } from '$lib/features/lessons/server/lesson-service';
import { lessonBodySchema, attachmentIdSchema } from '$lib/features/lessons/validation';
import { loadQuizEditor, quizEditorActions } from '$lib/features/quizzes/server/quiz-page';
import { loadExerciseEditor, exerciseEditorActions } from '$lib/features/exercises/server/exercise-page';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
  const actor = requireStaff(locals, url);
  try {
    const { item, course } = await resolveManagedItem(
      locals.runtime.db,
      actor,
      params.itemId,
      params.courseId
    );
    if (item.type === 'lesson') {
      return { item, course, detail: await loadLessonEditor(locals.runtime.db, actor, item.id) };
    }
    if (item.type === 'quiz') {
      return { item, course, detail: await loadQuizEditor(locals.runtime.db, actor, item.id) };
    }
    return { item, course, detail: await loadExerciseEditor(locals.runtime.db, actor, item.id) };
  } catch (cause) {
    rethrowRouteError(cause);
  }
};

export const actions: Actions = {
  ...quizEditorActions,
  ...exerciseEditorActions,
  renameItem: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await event.request.formData();
      const parsed = itemTitleSchema.safeParse({ title: form.get('title') });
      if (!parsed.success) throw new ValidationError('manage.error.invalidInput');
      await renameItem(event.locals.runtime.db, actor, event.params.itemId, parsed.data.title);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  saveLesson: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await event.request.formData();
      const parsed = lessonBodySchema.safeParse({ bodyMd: form.get('bodyMd') });
      if (!parsed.success) throw new ValidationError('lesson.error.invalidBody');
      await saveLesson(event.locals.runtime.db, actor, event.params.itemId, parsed.data.bodyMd);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  uploadAttachment: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await event.request.formData();
      const file = form.get('file');
      if (!(file instanceof File)) throw new ValidationError('lesson.error.fileType');
      const attachment = await addAttachment(
        event.locals.runtime.db,
        event.locals.runtime.files,
        actor,
        event.params.itemId,
        file
      );
      return { ok: true, attachment };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  deleteAttachment: async (event) => {
    const actor = requireStaff(event.locals, event.url);
    try {
      const form = await event.request.formData();
      const parsed = attachmentIdSchema.safeParse({ attachmentId: form.get('attachmentId') });
      if (!parsed.success) throw new ValidationError('lesson.error.invalidInput');
      await deleteAttachment(
        event.locals.runtime.db,
        event.locals.runtime.files,
        actor,
        parsed.data.attachmentId
      );
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  }
};
