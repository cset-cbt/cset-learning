import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const rows = await db.query.users.findMany({
		orderBy: [desc(users.createdAt)],
		with: {
			profile: true,
			userRoles: {
				with: {
					role: true
				}
			}
		}
	});

	return {
		users: rows.map((user) => ({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			createdAt: user.createdAt,
			profile: user.profile,
			roles: user.userRoles.map((userRole) => userRole.role.name)
		}))
	};
};
