import { getLocale } from '$lib/core/i18n';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, cookies }) => ({
  user: locals.user,
  locale: getLocale(cookies)
});
