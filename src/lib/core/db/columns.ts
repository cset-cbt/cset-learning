import { integer, text } from 'drizzle-orm/sqlite-core';

// Shared column builders. Timestamps use Drizzle's `timestamp` mode (stored as unix seconds).
export const uuidPk = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

export const createdAtColumn = () =>
  integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date());

export const updatedAtColumn = () =>
  integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date());
