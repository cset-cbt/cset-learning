import { z } from 'zod';
import { ValidationError } from '$lib/core/errors';
import type { QuizQuestionKind } from '../schema';
export const QUESTION_KINDS = [
  'single_choice',
  'multiple_choice',
  'true_false',
  'short_answer',
  'numeric',
  'matching'
] as const satisfies readonly QuizQuestionKind[];


const idSchema = z.string().min(1).max(64).regex(/^[0-9a-zA-Z_-]+$/);
const optionSchema = z.object({ id: idSchema, text: z.string().min(1).max(300) }).strict();
const optionsSchema = z
  .array(optionSchema)
  .min(2)
  .max(8)
  .superRefine((options, context) => addUniqueIds(options, context));

function addUniqueIds(
  options: { id: string }[],
  context: z.RefinementCtx
): void {
  const ids = new Set<string>();
  for (const option of options) {
    if (ids.has(option.id)) context.addIssue({ code: 'custom', message: 'Duplicate id' });
    ids.add(option.id);
  }
}

export const configSchemas = {
  single_choice: z.object({ options: optionsSchema }).strict(),
  multiple_choice: z.object({ options: optionsSchema }).strict(),
  true_false: z.object({}).strict(),
  short_answer: z.object({}).strict(),
  numeric: z.object({ unit: z.string().max(100).optional() }).strict(),
  matching: z
    .object({ left: optionsSchema, right: optionsSchema })
    .strict()
    .superRefine((config, context) => {
      if (config.left.length !== config.right.length) {
        context.addIssue({ code: 'custom', message: 'Matching sides must be equal' });
      }
    })
} as const;

const correctOptionSchema = z.object({ correctOptionId: idSchema }).strict();
const correctOptionsSchema = z
  .object({ correctOptionIds: z.array(idSchema).min(1).max(8) })
  .strict()
  .superRefine(({ correctOptionIds }, context) => {
    if (new Set(correctOptionIds).size !== correctOptionIds.length) {
      context.addIssue({ code: 'custom', message: 'Duplicate answer id' });
    }
  });
const pairMapSchema = z.record(idSchema, idSchema).superRefine((pairs, context) => {
  if (new Set(Object.values(pairs)).size !== Object.keys(pairs).length) {
    context.addIssue({ code: 'custom', message: 'Matching answers must be unique' });
  }
});

export const answerKeySchemas = {
  single_choice: correctOptionSchema,
  multiple_choice: correctOptionsSchema,
  true_false: z.object({ correct: z.boolean() }).strict(),
  short_answer: z
    .object({ accepted: z.array(z.string().min(1).max(200)).min(1).max(10), caseSensitive: z.boolean() })
    .strict(),
  numeric: z.object({ value: z.number().finite(), tolerance: z.number().finite().min(0) }).strict(),
  matching: z.object({ pairs: pairMapSchema }).strict()
} as const;

export const answerSchemas = {
  single_choice: idSchema,
  multiple_choice: z.array(idSchema).max(8),
  true_false: z.boolean(),
  short_answer: z.string().max(2000),
  numeric: z.string().max(200),
  matching: z.record(z.string(), z.string())
} as const;

export type QuestionConfigMap = { [K in QuizQuestionKind]: z.infer<(typeof configSchemas)[K]> };
export type QuestionAnswerKeyMap = { [K in QuizQuestionKind]: z.infer<(typeof answerKeySchemas)[K]> };
export type QuestionConfig<K extends QuizQuestionKind = QuizQuestionKind> = {
  [P in K]: QuestionConfigMap[P];
}[K];
export type QuestionAnswerKey<K extends QuizQuestionKind = QuizQuestionKind> = {
  [P in K]: QuestionAnswerKeyMap[P];
}[K];
export type QuestionSpec = {
  [K in QuizQuestionKind]: { kind: K; config: QuestionConfigMap[K]; answerKey: QuestionAnswerKeyMap[K] };
}[QuizQuestionKind];

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    throw new ValidationError('quiz.error.invalidSpec');
  }
}

export function parseQuestionConfig<K extends QuizQuestionKind>(kind: K, value: unknown): QuestionConfigMap[K] {
  const result = configSchemas[kind].safeParse(value);
  if (!result.success) throw new ValidationError('quiz.error.invalidSpec');
  return result.data as QuestionConfigMap[K];
}

function parseQuestionAnswerKey<K extends QuizQuestionKind>(kind: K, value: unknown): QuestionAnswerKeyMap[K] {
  const result = answerKeySchemas[kind].safeParse(value);
  if (!result.success) throw new ValidationError('quiz.error.invalidSpec');
  return result.data as QuestionAnswerKeyMap[K];
}

export function parseQuestionSpec(kind: QuizQuestionKind, configJson: string, answerKeyJson: string): QuestionSpec {
  const configValue = parseJson(configJson);
  const keyValue = parseJson(answerKeyJson);
  switch (kind) {
    case 'single_choice': {
      const config = parseQuestionConfig(kind, configValue);
      const answerKey = parseQuestionAnswerKey(kind, keyValue);
      if (!config.options.some((option) => option.id === answerKey.correctOptionId)) {
        throw new ValidationError('quiz.error.invalidSpec');
      }
      return { kind, config, answerKey };
    }
    case 'multiple_choice': {
      const config = parseQuestionConfig(kind, configValue);
      const answerKey = parseQuestionAnswerKey(kind, keyValue);
      if (answerKey.correctOptionIds.some((id) => !config.options.some((option) => option.id === id))) {
        throw new ValidationError('quiz.error.invalidSpec');
      }
      return { kind, config, answerKey };
    }
    case 'true_false':
      return { kind, config: parseQuestionConfig(kind, configValue), answerKey: parseQuestionAnswerKey(kind, keyValue) };
    case 'short_answer':
      return { kind, config: parseQuestionConfig(kind, configValue), answerKey: parseQuestionAnswerKey(kind, keyValue) };
    case 'numeric':
      return { kind, config: parseQuestionConfig(kind, configValue), answerKey: parseQuestionAnswerKey(kind, keyValue) };
    case 'matching': {
      const config = parseQuestionConfig(kind, configValue);
      const answerKey = parseQuestionAnswerKey(kind, keyValue);
      const leftIds = config.left.map((option) => option.id);
      const rightIds = config.right.map((option) => option.id);
      const pairIds = Object.keys(answerKey.pairs);
      if (
        leftIds.length !== pairIds.length ||
        leftIds.some((id) => !Object.hasOwn(answerKey.pairs, id)) ||
        Object.values(answerKey.pairs).some((id) => !rightIds.includes(id))
      ) throw new ValidationError('quiz.error.invalidSpec');
      return { kind, config, answerKey };
    }
  }
}
