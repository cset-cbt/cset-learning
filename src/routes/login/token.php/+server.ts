import { json, type RequestHandler } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import { generateWsToken } from '$lib/server/ws-auth';
import { moodleTokenError } from '$lib/server/ws-functions';

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const username = formData.get('username')?.toString() ?? '';
	const password = formData.get('password')?.toString() ?? '';
	const service = formData.get('service')?.toString() ?? '';

	if (service !== 'moodle_mobile_app') {
		return json(moodleTokenError('servicenotavailable', 'Service unavailable'));
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
			return json(moodleTokenError('invalidlogin', 'Invalid email or password'));
		}

		return json(moodleTokenError('servicenotavailable', 'Service unavailable'));
	}
};
