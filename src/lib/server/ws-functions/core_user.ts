import { inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { roles, userProfiles, userRoles, users } from '$lib/server/db/schema';

type WsUser = typeof users.$inferSelect;

export async function core_user_get_users_by_field(params: FormData, user: WsUser) {
	void user;

	const field = params.get('field')?.toString() ?? '';
	const values = readValues(params);

	if (!['id', 'email'].includes(field) || values.length === 0) {
		return [];
	}

	const matches = await db.query.users.findMany({
		where: inArray(field === 'id' ? users.id : users.email, values),
		with: {
			profile: true,
			userRoles: {
				with: {
					role: true
				}
			}
		}
	});

	return matches.map((user) => toMoodleUser(user));
}

function readValues(params: FormData) {
	const directValues = params.getAll('values[]').map((value) => value.toString());
	if (directValues.length > 0) return directValues;

	const indexedValues: string[] = [];
	for (const [key, value] of params.entries()) {
		if (/^values\[\d+\]$/.test(key)) indexedValues.push(value.toString());
	}

	return indexedValues;
}

function toMoodleUser(
	user: typeof users.$inferSelect & {
		profile: typeof userProfiles.$inferSelect | null;
		userRoles: Array<typeof userRoles.$inferSelect & { role: typeof roles.$inferSelect }>;
	}
) {
	const roleNames = user.userRoles.map((userRole) => userRole.role.name);
	const firstName = user.profile?.firstName ?? user.name.split(' ')[0] ?? '';
	const lastName = user.profile?.lastName ?? user.name.split(' ').slice(1).join(' ') ?? '';

	return {
		id: user.id,
		username: user.email,
		firstname: firstName,
		lastname: lastName,
		fullname: user.name,
		email: user.email,
		address: '',
		phone1: user.profile?.phone ?? '',
		phone2: '',
		department: '',
		institution: '',
		idnumber: '',
		interests: '',
		firstaccess: 0,
		lastaccess: 0,
		auth: 'manual',
		suspended: false,
		confirmed: user.emailVerified,
		lang: user.profile?.language ?? 'en',
		theme: '',
		timezone: user.profile?.timezone ?? 'UTC',
		mailformat: 1,
		description: user.profile?.bio ?? '',
		descriptionformat: 1,
		city: '',
		country: '',
		profileimageurlsmall: user.profile?.avatarUrl ?? user.image ?? '',
		profileimageurl: user.profile?.avatarUrl ?? user.image ?? '',
		roles: roleNames.map((role) => ({ shortname: role, name: role })),
		customfields: [],
		preferences: []
	};
}
