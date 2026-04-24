import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit';
import { deLocalizeUrl, getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';

const API_PATH_PREFIXES = ['/login/', '/webservice/', '/lib/ajax/'];

function canonicalPathname(url: string) {
	return deLocalizeUrl(url).pathname;
}

function isApiPath(pathname: string) {
	return API_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

const handleParaglide: Handle = ({ event, resolve }) => {
	const pathname = canonicalPathname(event.request.url);

	if (isApiPath(pathname)) {
		return resolve(event);
	}

	return paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});
};

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const pathname = canonicalPathname(event.request.url);

	if (isApiPath(pathname)) {
		return resolve(event);
	}

	event.locals.user = null;
	event.locals.session = null;

	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

const handleCors: Handle = async ({ event, resolve }) => {
	if (event.request.method === 'OPTIONS') {
		return new Response(null, { status: 204, headers: corsHeaders() });
	}

	const response = await resolve(event);

	for (const [key, value] of Object.entries(corsHeaders())) {
		response.headers.set(key, value);
	}

	return response;
};

function corsHeaders() {
	return {
		'access-control-allow-origin': '*',
		'access-control-allow-methods': 'GET, POST, OPTIONS',
		'access-control-allow-headers': 'content-type, authorization, x-requested-with',
		'access-control-max-age': '86400'
	};
}

export const handle: Handle = sequence(handleCors, handleParaglide, handleBetterAuth);
