import { requireUser } from '$lib/core/auth/guards';
import { listCatalog } from '$lib/features/courses/server/enrollment-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  const actor = requireUser(locals, url);
  return { courses: await listCatalog(locals.runtime.db, actor.id) };
};
