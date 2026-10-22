import { error, redirect } from '@sveltejs/kit';
import { isStaff } from '$lib/core/policy/access-control';
import type { SessionUser } from './session-user';

// Page loads run in parallel with layout loads, so every load and every action must call a
// guard itself; an anonymous visitor is always redirected to the login page, never shown a 403.
export function requireUser(locals: App.Locals, url?: URL): SessionUser {
  if (!locals.user) {
    const target = url ? `?next=${encodeURIComponent(url.pathname + url.search)}` : '';
    redirect(303, `/login${target}`);
  }
  return locals.user;
}

export function requireStaff(locals: App.Locals, url?: URL): SessionUser {
  const user = requireUser(locals, url);
  if (!isStaff(user.role)) error(403, 'Forbidden');
  return user;
}

export function requireAdmin(locals: App.Locals, url?: URL): SessionUser {
  const user = requireUser(locals, url);
  if (user.role !== 'admin') error(403, 'Forbidden');
  return user;
}
