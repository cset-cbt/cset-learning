import { z } from 'zod';
import { QUESTION_KINDS } from './shared/question-types';

const questionIdSchema = z.string().min(1).max(100);
const settingsSchema = z.object({
  passPercent: z.number().int().min(1).max(100),
  maxAttempts: z.number().int().min(1).max(100).nullable()
}).strict();
const questionSchema = z.object({
  questionId: questionIdSchema.optional(),
  kind: z.enum(QUESTION_KINDS),
  promptMd: z.string().min(1).max(5000),
  points: z.number().int().min(1).max(100),
  explanationMd: z.string().max(5000).nullable(),
  spec: z.string().min(2).max(20000)
}).strict();
const answersSchema = z.record(z.string(), z.unknown()).superRefine((answers, context) => {
  if (Object.keys(answers).length > 100) context.addIssue({ code: 'custom', message: 'Too many answers' });
});

export type QuizSettingsInput = z.infer<typeof settingsSchema>;
export type QuizQuestionInput = z.infer<typeof questionSchema>;

export function parseQuizSettings(value: unknown): QuizSettingsInput | null {
  const result = settingsSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function parseQuizQuestion(value: unknown): QuizQuestionInput | null {
  const result = questionSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function parseQuizAnswers(raw: string): Record<string, unknown> | null {
  if (raw.length > 20000) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  const result = answersSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function parseQuestionActionId(value: unknown): string | null {
  const result = questionIdSchema.safeParse(value);
  return result.success ? result.data : null;
}
