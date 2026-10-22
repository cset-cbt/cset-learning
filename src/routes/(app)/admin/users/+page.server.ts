import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/core/auth/guards';
import { actionFailure } from '$lib/core/errors';
import {
  banSchema,
  parseUserListQuery,
  setPasswordSchema,
  setRoleSchema,
  unbanSchema
} from '$lib/features/admin/shared/admin-validation';
import {
  banUser,
  listAdminUsers,
  resetUserPassword,
  setUserRole,
  unbanUser
} from '$lib/features/admin/server/admin-user-service';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, request }) => {
  requireAdmin(locals, url);
  const query = parseUserListQuery(url.searchParams);
  const { users, total } = await listAdminUsers(locals.runtime.auth, request.headers, query);
  return { users, total, page: query.page, q: query.q };
};

// Each action authorizes itself (page loads and actions are independent requests), validates
// the form with a strict schema and records an audit entry through the service.
export const actions: Actions = {
  setRole: async ({ locals, url, request }) => {
    const actor = requireAdmin(locals, url);
    const parsed = setRoleSchema.safeParse(Object.fromEntries(await request.formData()));
    if (!parsed.success) return fail(400, { error: 'admin.error.invalid' });
    try {
      await setUserRole(locals.runtime.db, actor, parsed.data);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },

  setPassword: async ({ locals, url, request }) => {
    const actor = requireAdmin(locals, url);
    const parsed = setPasswordSchema.safeParse(Object.fromEntries(await request.formData()));
    if (!parsed.success) return fail(400, { error: 'auth.error.passwordLength' });
    try {
      const { auth, db } = locals.runtime;
      await resetUserPassword(auth, request.headers, db, actor, parsed.data);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },

  ban: async ({ locals, url, request }) => {
    const actor = requireAdmin(locals, url);
    const parsed = banSchema.safeParse(Object.fromEntries(await request.formData()));
    if (!parsed.success) return fail(400, { error: 'admin.error.invalid' });
    try {
      const { auth, db } = locals.runtime;
      await banUser(auth, request.headers, db, actor, parsed.data);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },

  unban: async ({ locals, url, request }) => {
    const actor = requireAdmin(locals, url);
    const parsed = unbanSchema.safeParse(Object.fromEntries(await request.formData()));
    if (!parsed.success) return fail(400, { error: 'admin.error.invalid' });
    try {
      const { auth, db } = locals.runtime;
      await unbanUser(auth, request.headers, db, actor, parsed.data);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  }
};
