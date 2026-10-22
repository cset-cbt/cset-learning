import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { requireUser } from '$lib/core/auth/guards';
import { actionFailure, NotFoundError } from '$lib/core/errors';
import { getCompletedItemIds, getCourseForLearner } from '$lib/features/courses/server/enrollment-service';
import { resolveLearnerItem } from '$lib/features/courses/server/item-access';
import { markItemComplete } from '$lib/features/courses/server/progress-service';
import { loadLessonPlayer } from '$lib/features/lessons/server/lesson-service';
import { loadQuizPlayer, submitQuizAction } from '$lib/features/quizzes/server/quiz-page';
import { loadExercisePlayer, submitExerciseAction } from '$lib/features/exercises/server/exercise-page';
import { rethrowRouteError } from '$lib/features/courses/server/route-errors';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
  const actor = requireUser(locals, url);
  const db = locals.runtime.db;
  try {
    const courseData = await getCourseForLearner(db, actor, params.slug);
    if (!courseData.enrolled && !courseData.canManage) {
      redirect(303, resolve('/(app)/courses/[slug]', { slug: params.slug }));
    }
    const { item } = await resolveLearnerItem(db, actor, params.itemId, params.slug);
    const completed = await getCompletedItemIds(db, actor.id, courseData.course.id);
    const flatItems = courseData.outline.flatMap((section) => section.items);
    const index = flatItems.findIndex((entry) => entry.id === item.id);
    const navigation = {
      previousItemId: index > 0 ? flatItems[index - 1].id : null,
      nextItemId: index >= 0 && index < flatItems.length - 1 ? flatItems[index + 1].id : null,
      completedItemIds: [...completed],
      completed: completed.has(item.id)
    };
    if (item.type === 'lesson') {
      return {
        course: courseData.course,
        outline: courseData.outline,
        item,
        ...navigation,
        detail: await loadLessonPlayer(db, actor, item.id, params.slug)
      };
    }
    if (item.type === 'quiz') {
      return {
        course: courseData.course,
        outline: courseData.outline,
        item,
        ...navigation,
        detail: await loadQuizPlayer(db, actor, item.id)
      };
    }
    return {
      course: courseData.course,
      outline: courseData.outline,
      item,
      ...navigation,
      detail: await loadExercisePlayer(db, actor, item.id)
    };
  } catch (cause) {
    rethrowRouteError(cause);
  }
};

export const actions: Actions = {
  complete: async (event) => {
    const actor = requireUser(event.locals, event.url);
    try {
      await markItemComplete(
        event.locals.runtime.db,
        actor,
        event.params.itemId,
        event.params.slug
      );
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  submit: async (event) => {
    const actor = requireUser(event.locals, event.url);
    try {
      const { item } = await resolveLearnerItem(
        event.locals.runtime.db,
        actor,
        event.params.itemId,
        event.params.slug
      );
      if (item.type === 'quiz') return await submitQuizAction(event);
      if (item.type === 'exercise') return await submitExerciseAction(event);
      throw new NotFoundError();
    } catch (cause) {
      return actionFailure(cause);
    }
  }
};
