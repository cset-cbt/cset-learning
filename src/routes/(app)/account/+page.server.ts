import { fail } from '@sveltejs/kit';
import { requireUser } from '$lib/core/auth/guards';
import { actionFailure, ValidationError } from '$lib/core/errors';
import { removeAvatar, uploadAvatar } from '$lib/core/auth/avatar-service';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = requireUser(locals, url);
  return { user };
};

export const actions: Actions = {
  uploadAvatar: async ({ locals, url, request }) => {
    const user = requireUser(locals, url);
    try {
      const formData = await request.formData();
      const file = formData.get('avatar');
      if (!(file instanceof File)) {
        throw new ValidationError('account.error.noFileSelected');
      }
      const { avatarUrl } = await uploadAvatar(
        locals.runtime.db,
        locals.runtime.files,
        user,
        file
      );
      return { ok: true, avatarUrl };
    } catch (cause) {
      return actionFailure(cause);
    }
  },

  removeAvatar: async ({ locals, url }) => {
    const user = requireUser(locals, url);
    try {
      await removeAvatar(locals.runtime.db, locals.runtime.files, user);
      return { ok: true, removed: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  }
};
