import { createAuthClient } from 'better-auth/svelte';

// Browser-only, same origin. Sign-in, sign-up and change-password MUST use this client (HTTP)
// instead of `auth.api.*` on the server, because the rate limiter only runs on HTTP requests.
export const authClient = createAuthClient();
