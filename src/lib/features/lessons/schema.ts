import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createdAtColumn, uuidPk } from '../../core/db/columns';
import { user } from '../../core/db/better-auth-schema';
import { courseItem } from '../courses/schema';

export const lesson = sqliteTable('lesson', {
  itemId: text('item_id')
    .primaryKey()
    .references(() => courseItem.id, { onDelete: 'cascade' }),
  bodyMd: text('body_md').notNull().default('')
});

export const attachment = sqliteTable(
  'attachment',
  {
    id: uuidPk(),
    itemId: text('item_id')
      .notNull()
      .references(() => courseItem.id, { onDelete: 'cascade' }),
    fileName: text('file_name').notNull(),
    contentType: text('content_type').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    r2Key: text('r2_key').notNull().unique(),
    uploadedBy: text('uploaded_by')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    createdAt: createdAtColumn()
  },
  (table) => [index('attachment_item_idx').on(table.itemId)]
);
