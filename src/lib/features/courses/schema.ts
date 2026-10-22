import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createdAtColumn, updatedAtColumn, uuidPk } from '../../core/db/columns';
import { user } from '../../core/db/better-auth-schema';
import type { CourseStatus, ItemType } from './shared/course-types';

export const course = sqliteTable('course', {
  id: uuidPk(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  summary: text('summary').notNull().default(''),
  coverImageUrl: text('cover_image_url'),
  status: text('status').$type<CourseStatus>().notNull().default('draft'),
  // Restrict: a user who still owns courses cannot be deleted by accident.
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'restrict' }),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn()
});

export const courseSection = sqliteTable(
  'course_section',
  {
    id: uuidPk(),
    courseId: text('course_id')
      .notNull()
      .references(() => course.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    position: integer('position').notNull(),
    createdAt: createdAtColumn()
  },
  (table) => [index('course_section_course_position_idx').on(table.courseId, table.position)]
);

export const courseItem = sqliteTable(
  'course_item',
  {
    id: uuidPk(),
    courseId: text('course_id')
      .notNull()
      .references(() => course.id, { onDelete: 'cascade' }),
    sectionId: text('section_id')
      .notNull()
      .references(() => courseSection.id, { onDelete: 'cascade' }),
    type: text('type').$type<ItemType>().notNull(),
    title: text('title').notNull(),
    position: integer('position').notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn()
  },
  (table) => [
    index('course_item_section_position_idx').on(table.sectionId, table.position),
    index('course_item_course_idx').on(table.courseId)
  ]
);

export const enrollment = sqliteTable(
  'enrollment',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    courseId: text('course_id')
      .notNull()
      .references(() => course.id, { onDelete: 'cascade' }),
    enrolledAt: integer('enrolled_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date())
  },
  (table) => [primaryKey({ columns: [table.userId, table.courseId] })]
);

export const itemProgress = sqliteTable(
  'item_progress',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    itemId: text('item_id')
      .notNull()
      .references(() => courseItem.id, { onDelete: 'cascade' }),
    completedAt: integer('completed_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date())
  },
  (table) => [primaryKey({ columns: [table.userId, table.itemId] })]
);

export const courseInstructor = sqliteTable(
  'course_instructor',
  {
    courseId: text('course_id')
      .notNull()
      .references(() => course.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: text('role').$type<'lead' | 'instructor' | 'assistant'>().notNull().default('instructor'),
    assignedAt: integer('assigned_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date())
  },
  (table) => [primaryKey({ columns: [table.courseId, table.userId] })]
);
