import { z } from 'zod';
import { ITEM_TYPES } from './shared/course-types';

export const courseFieldsSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    summary: z.string().max(280),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80)
  })
  .strict();

export const createCourseSchema = z
  .object({ title: z.string().trim().min(1).max(120), summary: z.string().max(280) })
  .strict();

export const courseStatusSchema = z.object({ status: z.enum(['draft', 'published']) }).strict();
export const sectionTitleSchema = z.object({ title: z.string().trim().min(1).max(120) }).strict();
export const itemTitleSchema = z.object({ title: z.string().trim().min(1).max(120) }).strict();
export const moveSchema = z.object({ direction: z.enum(['up', 'down']) }).strict();
export const uuidSchema = z.string().uuid();
export const addItemSchema = z
  .object({
    sectionId: z.string().uuid(),
    type: z.enum(ITEM_TYPES),
    title: z.string().trim().min(1).max(120)
  })
  .strict();
