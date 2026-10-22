import { redirect } from '@sveltejs/kit';
import { safeNextPath } from '$lib/core/auth/safe-next-path';
import type { LayoutServerLoad } from './$types';

// Signed-in users have no business on the login or register pages.
export const load: LayoutServerLoad = ({ locals, url }) => {
  if (locals.user) {
    redirect(303, safeNextPath(url.searchParams.get('next')));
  }
  return {};
};
