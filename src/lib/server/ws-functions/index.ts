import { core_user_get_users_by_field } from './core_user';
import { core_webservice_get_site_info } from './core_webservice';
import type { users } from '$lib/server/db/schema';

type WsUser = typeof users.$inferSelect;

export async function dispatch(wsfunction: string, formData: FormData, user: WsUser) {
	switch (wsfunction) {
		case 'core_webservice_get_site_info':
			return core_webservice_get_site_info(formData, user);
		case 'core_user_get_users_by_field':
			return core_user_get_users_by_field(formData, user);
		default:
			return moodleError('invalidparameter', `Unknown web service function: ${wsfunction}`);
	}
}

export function moodleError(errorcode: string, message: string) {
	return {
		exception: 'moodle_exception',
		errorcode,
		message,
		stacktrace: null,
		debuginfo: null,
		reproductionlink: null
	};
}

export function moodleTokenError(errorcode: string, error: string) {
	return {
		error,
		errorcode,
		stacktrace: null,
		debuginfo: null,
		reproductionlink: null
	};
}
