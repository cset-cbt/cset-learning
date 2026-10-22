import { eq } from 'drizzle-orm';
import type { SessionUser } from '$lib/core/auth/session-user';
import type { LearningDb } from '$lib/core/db/client';
import { NotFoundError, ValidationError } from '$lib/core/errors';
import { resolveLearnerItem } from '$lib/features/courses/server/item-access';
import { itemProgress } from '$lib/features/courses/schema';
import { exercise, exerciseSubmission, exerciseTest } from '../schema';
import { judgeSubmission } from '../shared/judge-submission';
import { submissionPayloadSchema, type SubmissionPayload } from '../shared/submission-schema';

function parsePayload(raw: unknown): SubmissionPayload {
  let value = raw;
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw);
    } catch {
      throw new ValidationError('exercise.error.invalidPayload');
    }
  }
  const parsed = submissionPayloadSchema.safeParse(value);
  if (!parsed.success) throw new ValidationError('exercise.error.invalidPayload');
  return parsed.data;
}

export async function submitExercise(
  db: LearningDb,
  user: SessionUser,
  itemId: string,
  rawPayload: unknown
): Promise<{ status: 'passed' | 'failed' | 'compile_error'; passedCount: number; totalCount: number }> {
  const { item } = await resolveLearnerItem(db, user, itemId);
  if (item.type !== 'exercise') throw new NotFoundError();
  const payload = parsePayload(rawPayload);
  const exerciseRows = await db
    .select({ language: exercise.language })
    .from(exercise)
    .where(eq(exercise.itemId, itemId))
    .limit(1);
  const config = exerciseRows[0];
  if (!config) throw new NotFoundError();
  const tests = await db
    .select({ expectedStdout: exerciseTest.expectedStdout })
    .from(exerciseTest)
    .where(eq(exerciseTest.itemId, itemId))
    .orderBy(exerciseTest.position);
  const judgment = judgeSubmission(tests, payload);
  const insertion = db.insert(exerciseSubmission).values({
    itemId,
    userId: user.id,
    language: config.language,
    sourceCode: payload.sourceCode,
    status: judgment.status,
    passedCount: judgment.passedCount,
    totalCount: judgment.totalCount,
    detail: JSON.stringify(judgment.detail),
    message: judgment.message
  });
  if (judgment.status === 'passed') {
    await db.batch([
      insertion,
      db.insert(itemProgress).values({ userId: user.id, itemId }).onConflictDoNothing()
    ]);
  } else {
    await db.batch([insertion]);
  }
  return {
    status: judgment.status,
    passedCount: judgment.passedCount,
    totalCount: judgment.totalCount
  };
}
