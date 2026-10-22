import { z } from 'zod';

export const lessonBodySchema = z.object({ bodyMd: z.string().max(100000) }).strict();
export const attachmentIdSchema = z.object({ attachmentId: z.string().uuid() }).strict();
