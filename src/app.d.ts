import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
import type { SessionUser } from '$lib/core/auth/session-user';
import type { LearningRuntime } from '$lib/core/runtime';

declare global {
  namespace App {
    interface Platform {
      env: {
        DB: D1Database;
        FILES: R2Bucket;
        [key: string]: unknown;
      };
    }
    interface Locals {
      runtime: LearningRuntime;
      session: unknown;
      user: SessionUser | null;
    }
  }
}

export {};
