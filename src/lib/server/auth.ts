import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { BETTER_AUTH_SECRET, BETTER_AUTH_URL } from '$env/static/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { schema } from '$lib/server/db/schema';

export const auth = betterAuth({
	appName: 'CSET Learning',
	baseURL: BETTER_AUTH_URL,
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg', schema, usePlural: true, camelCase: true }),
	emailAndPassword: { enabled: true },
	session: {
		expiresIn: 60 * 60 * 24 * 30,
		updateAge: 60 * 60 * 24
	},
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
