import { json, type RequestHandler } from '@sveltejs/kit';
import { validateWsToken } from '$lib/server/ws-auth';
import { core_webservice_get_site_info } from '$lib/server/ws-functions/core_webservice';
import { dispatch, moodleError } from '$lib/server/ws-functions';

const PUBLIC_WS_FUNCTIONS = new Set(['tool_mobile_get_public_config']);

export const GET: RequestHandler = async ({ url }) => {
	const wsfunction = url.searchParams.get('wsfunction');
	const moodlewsrestformat = url.searchParams.get('moodlewsrestformat') ?? 'json';

	if (moodlewsrestformat !== 'json') {
		return json(moodleError('invalidparameter', 'Only JSON format is supported'));
	}

	if (wsfunction === 'core_webservice_get_site_info') {
		return json(await core_webservice_get_site_info(new FormData(), null));
	}

	if (wsfunction === 'tool_mobile_get_public_config') {
		return json(await dispatch(wsfunction, new FormData(), null));
	}

	return json(moodleError('invalidparameter', 'Unknown web service function'));
};

export const POST: RequestHandler = async ({ request }) => {
	const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
	const formData = new FormData();

	if (contentType.includes('application/json')) {
		const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
		for (const [key, value] of Object.entries(body)) {
			if (value !== undefined && value !== null) {
				formData.set(key, String(value));
			}
		}
	} else {
		const incoming = await request.formData();
		for (const [key, value] of incoming.entries()) {
			formData.append(key, value);
		}
	}

	const token = formData.get('wstoken')?.toString() ?? '';
	const wsfunction = formData.get('wsfunction')?.toString() ?? '';
	const moodlewsrestformat = formData.get('moodlewsrestformat')?.toString() ?? 'json';

	if (moodlewsrestformat !== 'json') {
		return json(moodleError('invalidparameter', 'Only JSON format is supported'));
	}

	if (PUBLIC_WS_FUNCTIONS.has(wsfunction)) {
		return json(await dispatch(wsfunction, formData, null));
	}

	const user = await validateWsToken(token);
	if (!user) {
		return json(moodleError('invalidtoken', 'Invalid token'));
	}

	const result = await dispatch(wsfunction, formData, user);
	return json(result);
};
