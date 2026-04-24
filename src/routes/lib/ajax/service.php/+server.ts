import { json, type RequestHandler } from '@sveltejs/kit';
import {
	buildAjaxBatchResponse,
	buildAjaxInfoResponse
} from '$lib/server/ws-functions/mobile_public_config';

export const POST: RequestHandler = async ({ request, url }) => {
	const responses = await buildAjaxBatchResponse(request, url.origin);
	return json(responses);
};

export const GET: RequestHandler = async ({ url }) => {
	return json(buildAjaxInfoResponse(url.searchParams.get('info'), url.origin));
};
