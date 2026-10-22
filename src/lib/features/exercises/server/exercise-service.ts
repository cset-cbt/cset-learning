import { and, desc, eq } from 'drizzle-orm';
import type { SessionUser } from '$lib/core/auth/session-user';
import type { LearningDb } from '$lib/core/db/client';
import { NotFoundError } from '$lib/core/errors';
import { resolveLearnerItem, resolveManagedItem } from '$lib/features/courses/server/item-access';
import { courseItem } from '$lib/features/courses/schema';
import { exercise, exerciseSubmission, exerciseTest } from '../schema';
import type { ExerciseEditorData, ExerciseTestCase } from '../shared/contract';
import { parseExerciseInput, type ExerciseInput } from '../shared/validation';

async function readExercise(db: LearningDb, itemId: string): Promise<ExerciseEditorData> {
  const rows = await db
    .select({ language: exercise.language, promptMd: exercise.promptMd, starterCode: exercise.starterCode, timeLimitMs: exercise.timeLimitMs })
    .from(exercise)
    .where(eq(exercise.itemId, itemId))
    .limit(1);
  const row = rows[0];
  if (!row) throw new NotFoundError();
  const tests: ExerciseTestCase[] = await db
    .select({ stdin: exerciseTest.stdin, expectedStdout: exerciseTest.expectedStdout })
    .from(exerciseTest)
    .where(eq(exerciseTest.itemId, itemId))
    .orderBy(exerciseTest.position);
  return { ...row, tests };
}

export async function getExerciseForEditor(
  db: LearningDb,
  user: SessionUser,
  itemId: string
): Promise<ExerciseEditorData> {
  const { item } = await resolveManagedItem(db, user, itemId);
  if (item.type !== 'exercise') throw new NotFoundError();
  return readExercise(db, itemId);
}

export async function saveExercise(
  db: LearningDb,
  user: SessionUser,
  itemId: string,
  rawInput: unknown
): Promise<void> {
  const { item } = await resolveManagedItem(db, user, itemId);
  if (item.type !== 'exercise') throw new NotFoundError();
  const input = parseExerciseInput(rawInput);
  await readExercise(db, itemId);
  await persistExercise(db, itemId, input);
}

async function persistExercise(db: LearningDb, itemId: string, input: ExerciseInput): Promise<void> {
  const statements = [
    db.update(exercise).set({
      language: input.language,
      promptMd: input.promptMd,
      starterCode: input.starterCode,
      timeLimitMs: input.timeLimitMs
    }).where(eq(exercise.itemId, itemId)),
    db.delete(exerciseTest).where(eq(exerciseTest.itemId, itemId)),
    ...input.tests.map((test, index) =>
      db.insert(exerciseTest).values({ itemId, position: index + 1, ...test })
    ),
    db.update(courseItem).set({ updatedAt: new Date() }).where(eq(courseItem.id, itemId))
  ];
  const [first, ...rest] = statements;
  await db.batch([first, ...rest]);
}

export async function loadExerciseForLearner(
  db: LearningDb,
  user: SessionUser,
  itemId: string
): Promise<ExerciseEditorData & { lastSubmission: { sourceCode: string } | null }> {
  const { item } = await resolveLearnerItem(db, user, itemId);
  if (item.type !== 'exercise') throw new NotFoundError();
  const submissions = await db
    .select({ sourceCode: exerciseSubmission.sourceCode })
    .from(exerciseSubmission)
    .where(and(eq(exerciseSubmission.userId, user.id), eq(exerciseSubmission.itemId, itemId)))
    .orderBy(desc(exerciseSubmission.createdAt))
    .limit(1);
  return {
    ...(await readExercise(db, itemId)),
    lastSubmission: submissions[0] ? { sourceCode: submissions[0].sourceCode } : null
  };
}
