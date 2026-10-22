import type { R2Bucket } from '@cloudflare/workers-types';
import type { BetterAuthPlugin } from 'better-auth';
import type { RequestEvent } from '@sveltejs/kit';
import { getAuth, type AuthInstance } from '$lib/core/auth/auth';
import { createDb, type LearningDb } from '$lib/core/db/client';
import { resolveEnv, type LearningEnv, type RuntimeBindings } from '$lib/core/env';

export interface LearningRuntime {
  env: LearningEnv;
  db: LearningDb;
  auth: AuthInstance;
  files: R2Bucket;
}

export function createRuntime(event: RequestEvent, cookiePlugin?: BetterAuthPlugin): LearningRuntime {
  const platformEnv = event.platform?.env;
  const env = resolveEnv(platformEnv as RuntimeBindings | undefined);
  const d1 = platformEnv?.DB;
  const files = platformEnv?.FILES;
  if (!d1) {
    throw new Error('Cloudflare D1 binding "DB" is missing in event.platform.env');
  }
  if (!files) {
    throw new Error('Cloudflare R2 binding "FILES" is missing in event.platform.env');
  }
  const db = createDb(d1);
  const auth = getAuth(d1, { env, db }, cookiePlugin);
  return { env, db, auth, files };
}
