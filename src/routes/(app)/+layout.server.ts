import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { roles, userProfiles, userRoles } from '$lib/server/db/schema';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const [profile] = await db
		.select()
		.from(userProfiles)
		.where(eq(userProfiles.userId, locals.user.id))
		.limit(1);

	const roleRows = await db
		.select({ name: roles.name })
		.from(userRoles)
		.innerJoin(roles, eq(userRoles.roleId, roles.id))
		.where(eq(userRoles.userId, locals.user.id));

	return {
		user: locals.user,
		profile: profile ?? null,
		roles: roleRows.map((role) => role.name)
	};
};
