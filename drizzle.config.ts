import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: [
    './src/lib/core/db/better-auth-schema.ts',
    './src/lib/core/db/audit-schema.ts',
    './src/lib/features/*/schema.ts'
  ],
  out: './drizzle',
  dialect: 'sqlite'
});
