import { json, type RequestHandler } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import { generateWsToken } from '$lib/server/ws-auth';
import { moodleTokenError } from '$lib/server/ws-functions';

const ALLOWED_SERVICES = new Set(['moodle_mobile_app', 'moodle_mobile_app_service']);

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const username = formData.get('username')?.toString().trim() ?? '';
	const password = formData.get('password')?.toString() ?? '';
	const service = formData.get('service')?.toString() ?? '';

	if (!ALLOWED_SERVICES.has(service)) {
		return json(moodleTokenError('servicenotavailable', 'Service not found'));
	}

	try {
		const result = await auth.api.signInEmail({
			body: {
				email: username,
				password
			}
		});

		const token = await generateWsToken(result.user.id);
		return json({ token, privatetoken: null });
	} catch (error) {
		if (error instanceof APIError) {
			return json(moodleTokenError('invalidlogin', 'Invalid login, please try again'));
		}

		return json(moodleTokenError('servicenotavailable', 'Service unavailable'));
	}
};
