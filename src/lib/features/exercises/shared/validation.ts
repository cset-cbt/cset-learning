import { z } from 'zod';
import { ValidationError } from '$lib/core/errors';
import { EXERCISE_LANGUAGES } from './languages';

const testCaseSchema = z
  .object({
    stdin: z.string().max(20000),
    expectedStdout: z.string().max(20000)
  })
  .strict();

export const exerciseInputSchema = z
  .object({
    language: z.enum(EXERCISE_LANGUAGES),
    promptMd: z.string().max(20000),
    starterCode: z.string().max(65536),
    timeLimitMs: z.number().int().min(500).max(10000),
    tests: z.array(testCaseSchema).max(30)
  })
  .strict();

export type ExerciseInput = z.infer<typeof exerciseInputSchema>;

export function parseExerciseInput(value: unknown): ExerciseInput {
  const parsed = exerciseInputSchema.safeParse(value);
  if (!parsed.success) throw new ValidationError('exercise.error.invalidExercise');
  return parsed.data;
}
