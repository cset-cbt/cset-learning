import { PUBLIC_SITE_URL } from '$env/static/public';
import { db } from '$lib/server/db';
import { roles, userProfiles, userRoles } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

type WsUser = {
	id: string;
	moodleUserId: number;
	name: string;
	email: string;
	image: string | null;
};

export async function core_webservice_get_site_info(_params: FormData, user: WsUser | null) {
	const profile = user
		? await db.query.userProfiles.findFirst({
				where: eq(userProfiles.userId, user.id)
			})
		: null;

	const roleRows = user
		? await db
				.select({ name: roles.name })
				.from(userRoles)
				.innerJoin(roles, eq(userRoles.roleId, roles.id))
				.where(eq(userRoles.userId, user.id))
		: [];

	return {
		sitename: 'CSET Learning',
		username: user?.email ?? '',
		firstname: profile?.firstName ?? user?.name?.split(' ')[0] ?? '',
		lastname: profile?.lastName ?? user?.name?.split(' ').slice(1).join(' ') ?? '',
		fullname: user?.name ?? '',
		lang: profile?.language ?? 'en',
		userid: user?.moodleUserId ?? 0,
		siteurl: PUBLIC_SITE_URL,
		userpictureurl: profile?.avatarUrl ?? user?.image ?? '',
		functions: [
			{
				name: 'core_webservice_get_site_info',
				version: '2022112800'
			},
			{
				name: 'tool_mobile_get_public_config',
				version: '2022112800'
			},
			{
				name: 'tool_mobile_get_config',
				version: '2022112800'
			},
			{
				name: 'core_user_get_users_by_field',
				version: '2022112800'
			}
		],
		downloadfiles: 1,
		uploadfiles: 0,
		release: '4.1+ (Build: 20221128)',
		version: '2022112800',
		mobilecssurl: '',
		advancedfeatures: [],
		usercanmanageownfiles: false,
		userquota: 0,
		usermaxuploadfilesize: 0,
		userhomepage: 1,
		userprivateaccesskey: null,
		theme: '',
		roles: roleRows.map((role) => role.name)
	};
}
