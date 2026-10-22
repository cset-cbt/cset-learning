import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import type { BetterAuthPlugin } from 'better-auth';
import { betterAuth } from 'better-auth/minimal';
import { admin } from 'better-auth/plugins';
import * as schema from '$lib/core/db/better-auth-schema';
import type { LearningDb } from '$lib/core/db/client';
import type { LearningEnv } from '$lib/core/env';

export function createAuth(
  runtime: { env: LearningEnv; db: LearningDb },
  cookiePlugin?: BetterAuthPlugin
) {
  const { env, db } = runtime;

  return betterAuth({
    database: drizzleAdapter(db, { provider: 'sqlite', schema }),
    secret: env.LEARNING_AUTH_SECRET,
    baseURL: env.LEARNING_BASE_URL,
    basePath: '/api/auth',
    trustedOrigins: [env.LEARNING_BASE_URL],
    advanced: {
      cookiePrefix: 'cset_learning',
      useSecureCookies: env.isProduction,
      defaultCookieAttributes: {
        sameSite: 'lax',
        secure: env.isProduction,
        httpOnly: true
      },
      ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] }
    },
    // No mail provider is configured, so there is no email verification and no reset-by-email:
    // an administrator resets forgotten passwords.
    emailAndPassword: {
      enabled: true,
      disableSignUp: false,
      requireEmailVerification: false,
      autoSignIn: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: false }
    },
    rateLimit: { enabled: true, storage: 'database' },
    plugins: [
      admin({ defaultRole: 'student', adminRoles: ['admin'] }),
      ...(cookiePlugin ? [cookiePlugin] : [])
    ]
  });
}

export type AuthInstance = ReturnType<typeof createAuth>;

// Building Better Auth on every request wastes the 10 ms CPU budget of the Workers Free plan,
// so a warm isolate reuses one instance per D1 binding.
const instances = new WeakMap<object, AuthInstance>();

export function getAuth(
  d1: D1Database,
  runtime: { env: LearningEnv; db: LearningDb },
  cookiePlugin?: BetterAuthPlugin
): AuthInstance {
  const cached = instances.get(d1);
  if (cached) return cached;
  const created = createAuth(runtime, cookiePlugin);
  instances.set(d1, created);
  return created;
}
