import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createdAtColumn, updatedAtColumn, uuidPk } from '../../core/db/columns';
import { user } from '../../core/db/better-auth-schema';
import { courseItem } from '../courses/schema';

export type QuizQuestionKind =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer'
  | 'numeric'
  | 'matching';

export const quiz = sqliteTable('quiz', {
  itemId: text('item_id')
    .primaryKey()
    .references(() => courseItem.id, { onDelete: 'cascade' }),
  passPercent: integer('pass_percent').notNull().default(70),
  // NULL means unlimited attempts.
  maxAttempts: integer('max_attempts')
});

export const quizQuestion = sqliteTable(
  'quiz_question',
  {
    id: uuidPk(),
    itemId: text('item_id')
      .notNull()
      .references(() => courseItem.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    kind: text('kind').$type<QuizQuestionKind>().notNull(),
    promptMd: text('prompt_md').notNull(),
    points: integer('points').notNull().default(1),
    // JSON visible to learners (options, left/right lists, unit).
    config: text('config').notNull().default('{}'),
    // JSON that never leaves the server before an attempt is submitted.
    answerKey: text('answer_key').notNull().default('{}'),
    explanationMd: text('explanation_md'),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn()
  },
  (table) => [index('quiz_question_item_position_idx').on(table.itemId, table.position)]
);

export const quizAttempt = sqliteTable(
  'quiz_attempt',
  {
    id: uuidPk(),
    itemId: text('item_id')
      .notNull()
      .references(() => courseItem.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    answers: text('answers').notNull(),
    detail: text('detail').notNull(),
    earnedPoints: integer('earned_points').notNull(),
    totalPoints: integer('total_points').notNull(),
    scorePercent: integer('score_percent').notNull(),
    passed: integer('passed', { mode: 'boolean' }).notNull(),
    createdAt: createdAtColumn()
  },
  (table) => [index('quiz_attempt_user_item_idx').on(table.userId, table.itemId)]
);
