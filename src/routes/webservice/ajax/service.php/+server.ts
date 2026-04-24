import { json, type RequestHandler } from '@sveltejs/kit';
import { tool_mobile_get_public_config } from '$lib/server/ws-functions/tool_mobile';

type AjaxRequest = {
	index?: number;
	methodname?: string;
	args?: Record<string, unknown>;
};

function resolveAjaxMethod(methodname?: string) {
	if (methodname === 'tool_mobile_get_public_config') {
		return { error: null, data: tool_mobile_get_public_config() };
	}

	return {
		error: {
			errorcode: 'invalidfunction',
			message: `Function '${methodname ?? ''}' is not available via AJAX.`
		},
		data: null
	};
}

export const POST: RequestHandler = async ({ request }) => {
	const payload = await request.json().catch(() => []);
	const requests = Array.isArray(payload) ? (payload as AjaxRequest[]) : [payload as AjaxRequest];

	const results = requests.map((entry) => {
		const result = resolveAjaxMethod(entry.methodname);
		if (typeof entry.index === 'number') {
			return { index: entry.index, ...result };
		}
		return result;
	});

	return json(results);
};

export const GET: RequestHandler = async ({ url }) => {
	const info = url.searchParams.get('info');

	if (info === 'tool_mobile_get_public_config') {
		return json([{ error: null, data: tool_mobile_get_public_config() }]);
	}

	return json([
		{
			error: {
				errorcode: 'invalidfunction',
				message: 'Function is not available via AJAX.'
			},
			data: null
		}
	]);
};
