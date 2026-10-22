import { requireUser } from '$lib/core/auth/guards';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, url }) => ({
  user: requireUser(locals, url)
});
