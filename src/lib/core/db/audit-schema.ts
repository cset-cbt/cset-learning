import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createdAtColumn, uuidPk } from './columns';

export const auditLog = sqliteTable('audit_log', {
  id: uuidPk(),
  actorId: text('actor_id'),
  action: text('action').notNull(),
  targetId: text('target_id'),
  metadata: text('metadata'),
  createdAt: createdAtColumn()
});
