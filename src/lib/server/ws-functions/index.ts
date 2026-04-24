import { core_user_get_users_by_field } from './core_user';
import { core_webservice_get_site_info } from './core_webservice';
import { core_course_get_courses } from './core_course_get_courses';
import { core_enrol_get_users_courses } from './core_enrol_get_users_courses';
import { tool_mobile_get_config, tool_mobile_get_public_config } from './tool_mobile';
import type { users } from '$lib/server/db/schema';

type WsUser = typeof users.$inferSelect;

export async function dispatch(wsfunction: string, formData: FormData, user: WsUser | null) {
	switch (wsfunction) {
		case 'core_webservice_get_site_info':
			if (!user) return moodleError('invalidtoken', 'Invalid token');
			return core_webservice_get_site_info(formData, user);
		case 'core_user_get_users_by_field':
			if (!user) return moodleError('invalidtoken', 'Invalid token');
			return core_user_get_users_by_field(formData, user);
		case 'core_course_get_courses':
			if (!user) return moodleError('invalidtoken', 'Invalid token');
			return core_course_get_courses(formData, user);
		case 'core_enrol_get_users_courses':
			if (!user) return moodleError('invalidtoken', 'Invalid token');
			return core_enrol_get_users_courses(formData, user);
		case 'tool_mobile_get_public_config':
			return tool_mobile_get_public_config();
		case 'tool_mobile_get_config':
			return tool_mobile_get_config();
		default:
			return moodleError('invalidrecord', `Function ${wsfunction} is not available.`);
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
