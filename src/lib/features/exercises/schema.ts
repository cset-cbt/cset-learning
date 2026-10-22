import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createdAtColumn, uuidPk } from '../../core/db/columns';
import { user } from '../../core/db/better-auth-schema';
import { courseItem } from '../courses/schema';

export type ExerciseLanguageId = 'python' | 'cpp' | 'java';
export type ExerciseSubmissionStatus = 'passed' | 'failed' | 'compile_error';

export const exercise = sqliteTable('exercise', {
  itemId: text('item_id')
    .primaryKey()
    .references(() => courseItem.id, { onDelete: 'cascade' }),
  language: text('language').$type<ExerciseLanguageId>().notNull().default('python'),
  promptMd: text('prompt_md').notNull().default(''),
  starterCode: text('starter_code').notNull().default(''),
  timeLimitMs: integer('time_limit_ms').notNull().default(3000)
});

export const exerciseTest = sqliteTable(
  'exercise_test',
  {
    id: uuidPk(),
    itemId: text('item_id')
      .notNull()
      .references(() => courseItem.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    stdin: text('stdin').notNull().default(''),
    expectedStdout: text('expected_stdout').notNull()
  },
  (table) => [index('exercise_test_item_position_idx').on(table.itemId, table.position)]
);

export const exerciseSubmission = sqliteTable(
  'exercise_submission',
  {
    id: uuidPk(),
    itemId: text('item_id')
      .notNull()
      .references(() => courseItem.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    language: text('language').$type<ExerciseLanguageId>().notNull(),
    sourceCode: text('source_code').notNull(),
    status: text('status').$type<ExerciseSubmissionStatus>().notNull(),
    passedCount: integer('passed_count').notNull(),
    totalCount: integer('total_count').notNull(),
    detail: text('detail').notNull(),
    message: text('message'),
    createdAt: createdAtColumn()
  },
  (table) => [index('exercise_submission_user_item_idx').on(table.userId, table.itemId)]
);
