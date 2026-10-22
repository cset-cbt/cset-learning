import { building } from '$app/environment';
import { getRequestEvent } from '$app/server';
import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler, sveltekitCookies } from 'better-auth/svelte-kit';
import { toSessionUser } from '$lib/core/auth/session-user';
import { createRuntime } from '$lib/core/runtime';

const cookiePlugin = sveltekitCookies(getRequestEvent);

export const handle: Handle = async ({ event, resolve }) => {
  const runtime = createRuntime(event, cookiePlugin);
  event.locals.runtime = runtime;
  event.locals.user = null;
  event.locals.session = null;

  if (!building) {
    const session = await runtime.auth.api.getSession({ headers: event.request.headers });
    if (session) {
      event.locals.user = toSessionUser(session.user);
      event.locals.session = session.session;
    }
  }

  const response = await svelteKitHandler({ event, resolve, auth: runtime.auth, building });
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
};
