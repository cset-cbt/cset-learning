import { json, type RequestHandler } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import { generateWsToken } from '$lib/server/ws-auth';
import { moodleTokenError } from '$lib/server/ws-functions';

const ALLOWED_SERVICES = new Set(['moodle_mobile_app', 'moodle_mobile_app_service']);

export const GET: RequestHandler = async ({ url }) => {
	if (url.searchParams.has('appsitecheck')) {
		return json({ appsitecheck: 'ok' });
	}

	return json(moodleTokenError('invalidparameter', 'Missing appsitecheck'));
};

export const POST: RequestHandler = async ({ request, url }) => {
	if (url.searchParams.has('appsitecheck')) {
		return json({ appsitecheck: 'ok' });
	}

	const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';

	const credentials = await (async () => {
		if (contentType.includes('application/json')) {
			const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
			return {
				username: String(body.username ?? '').trim(),
				password: String(body.password ?? ''),
				service: String(body.service ?? '')
			};
		}

		const formData = await request.formData();
		return {
			username: formData.get('username')?.toString().trim() ?? '',
			password: formData.get('password')?.toString() ?? '',
			service: formData.get('service')?.toString() ?? ''
		};
	})();

	const { username, password, service } = credentials;

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
		return json({ token, privatetoken: '' });
	} catch (error) {
		if (error instanceof APIError) {
			return json(moodleTokenError('invalidlogin', 'Invalid login, please try again'));
		}

		return json(moodleTokenError('servicenotavailable', 'Service unavailable'));
	}
};
