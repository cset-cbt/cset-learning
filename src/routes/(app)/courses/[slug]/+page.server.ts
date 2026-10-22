import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { requireUser } from '$lib/core/auth/guards';
import { actionFailure } from '$lib/core/errors';
import { enroll, getCompletedItemIds, getCourseForLearner } from '$lib/features/courses/server/enrollment-service';
import { getContinueItemId } from '$lib/features/courses/server/progress-service';
import { rethrowRouteError } from '$lib/features/courses/server/route-errors';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
  const actor = requireUser(locals, url);
  try {
    const data = await getCourseForLearner(locals.runtime.db, actor, params.slug);
    const completed = await getCompletedItemIds(locals.runtime.db, actor.id, data.course.id);
    return {
      ...data,
      completedItemIds: [...completed],
      continueItemId: getContinueItemId(data.outline, completed)
    };
  } catch (cause) {
    rethrowRouteError(cause);
  }
};

export const actions: Actions = {
  enroll: async (event) => {
    const actor = requireUser(event.locals, event.url);
    try {
      const db = event.locals.runtime.db;
      const data = await getCourseForLearner(db, actor, event.params.slug);
      await enroll(db, actor.id, data.course.id);
      const completed = await getCompletedItemIds(db, actor.id, data.course.id);
      const itemId = getContinueItemId(data.outline, completed);
      if (itemId) redirect(303, resolve('/(app)/courses/[slug]/learn/[itemId]', { slug: data.course.slug, itemId }));
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  }
};
