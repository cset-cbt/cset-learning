import { z } from 'zod';

const schema = z.object({
  LEARNING_AUTH_SECRET: z.string().min(32),
  LEARNING_BASE_URL: z.string().url()
});

export type LearningEnv = z.infer<typeof schema> & { isProduction: boolean };
export type RuntimeBindings = Record<string, unknown>;

function processBindings(): RuntimeBindings {
  const processObject: unknown = Reflect.get(globalThis, 'process');
  if (typeof processObject !== 'object' || processObject === null || !('env' in processObject)) {
    return {};
  }
  const env = processObject.env;
  return typeof env === 'object' && env !== null ? Object.fromEntries(Object.entries(env)) : {};
}

function value(raw: RuntimeBindings, key: string) {
  const candidate = raw[key];
  return typeof candidate === 'string' ? candidate : undefined;
}

// Non-production runs (vite dev, tests, build analysis) may lack a secret. Generate a random
// one per process instead of shipping a literal fallback: sessions then simply do not survive
// a restart, and production never reaches this path because it requires a real secret.
let ephemeralSecret: string | undefined;
function randomSecret(): string {
  if (!ephemeralSecret) {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    ephemeralSecret = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return ephemeralSecret;
}

export function resolveEnv(platformEnv?: RuntimeBindings): LearningEnv {
  const processEnv = processBindings();
  const raw = { ...processEnv, ...(platformEnv ?? {}) };
  const nodeEnv = value(processEnv, 'NODE_ENV') ?? value(platformEnv ?? {}, 'NODE_ENV');
  const isViteDev = nodeEnv !== 'test' && import.meta.env?.DEV === true;
  const isBuild = platformEnv === undefined && value(processEnv, 'LEARNING_BUILD') === '1';
  const isLocal =
    isViteDev ||
    (value(raw, 'LEARNING_LOCAL_DEV') === '1' && nodeEnv === 'development') ||
    (platformEnv === undefined && ['development', 'test'].includes(nodeEnv ?? ''));
  const isProduction = !isBuild && !isLocal;
  const localDefaults = isBuild || !isProduction;

  const parsed = schema.parse({
    LEARNING_AUTH_SECRET:
      value(raw, 'LEARNING_AUTH_SECRET') ?? (localDefaults ? randomSecret() : undefined),
    LEARNING_BASE_URL:
      value(raw, 'LEARNING_BASE_URL') ?? (localDefaults ? 'http://localhost:4177' : undefined)
  });

  if (isProduction && !parsed.LEARNING_BASE_URL.startsWith('https://')) {
    throw new Error('LEARNING_BASE_URL must use HTTPS in production');
  }

  return { ...parsed, isProduction };
}
