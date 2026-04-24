import { json, type RequestHandler } from '@sveltejs/kit';
import { validateWsToken } from '$lib/server/ws-auth';
import { core_webservice_get_site_info } from '$lib/server/ws-functions/core_webservice';
import { dispatch, moodleError } from '$lib/server/ws-functions';

const PUBLIC_WS_FUNCTIONS = new Set(['tool_mobile_get_public_config']);

export const GET: RequestHandler = async ({ url }) => {
	const wsfunction = url.searchParams.get('wsfunction');

	if (wsfunction === 'core_webservice_get_site_info') {
		return json(await core_webservice_get_site_info(new FormData(), null));
	}

	if (wsfunction === 'tool_mobile_get_public_config') {
		return json(await dispatch(wsfunction, new FormData(), null));
	}

	return json(moodleError('invalidparameter', 'Unknown web service function'), { status: 400 });
};

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const token = formData.get('wstoken')?.toString() ?? '';
	const wsfunction = formData.get('wsfunction')?.toString() ?? '';

	if (PUBLIC_WS_FUNCTIONS.has(wsfunction)) {
		return json(await dispatch(wsfunction, formData, null));
	}

	const user = await validateWsToken(token);
	if (!user) {
		return json(moodleError('invalidtoken', 'Invalid token'), { status: 401 });
	}

	const result = await dispatch(wsfunction, formData, user);
	const status = 'exception' in result ? 400 : 200;

	return json(result, { status });
};
