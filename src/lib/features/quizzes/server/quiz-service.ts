import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { SessionUser } from '$lib/core/auth/session-user';
import type { LearningDb } from '$lib/core/db/client';
import { quiz, quizQuestion } from '$lib/core/db/schema';
import { NotFoundError, ValidationError } from '$lib/core/errors';
import { resolveManagedItem } from '$lib/features/courses/server/item-access';
import type { QuizEditorData } from '../shared/contract';
import { parseQuestionSpec } from '../shared/question-types';
import { toEditorQuestion } from '../shared/to-public-question';
import { parseQuizQuestion, parseQuizSettings, type QuizQuestionInput } from '../validation';

const questionSpecSchema = z.object({ config: z.unknown(), answerKey: z.unknown() }).strict();

async function requireManagedQuiz(
  db: LearningDb,
  user: SessionUser,
  itemId: string
): Promise<{ passPercent: number; maxAttempts: number | null }> {
  const { item } = await resolveManagedItem(db, user, itemId);
  if (item.type !== 'quiz') throw new NotFoundError();
  const rows = await db
    .select({ passPercent: quiz.passPercent, maxAttempts: quiz.maxAttempts })
    .from(quiz)
    .where(eq(quiz.itemId, itemId))
    .limit(1);
  if (!rows[0]) throw new NotFoundError();
  return rows[0];
}

export async function getQuizForEditor(
  db: LearningDb,
  user: SessionUser,
  itemId: string
): Promise<QuizEditorData> {
  const settings = await requireManagedQuiz(db, user, itemId);
  const questions = await db
    .select({
      id: quizQuestion.id,
      kind: quizQuestion.kind,
      promptMd: quizQuestion.promptMd,
      points: quizQuestion.points,
      position: quizQuestion.position,
      config: quizQuestion.config,
      answerKey: quizQuestion.answerKey,
      explanationMd: quizQuestion.explanationMd
    })
    .from(quizQuestion)
    .where(eq(quizQuestion.itemId, itemId))
    .orderBy(asc(quizQuestion.position));
  return {
    settings,
    questions: questions.map(toEditorQuestion)
  };
}

export async function updateQuizSettings(
  db: LearningDb,
  user: SessionUser,
  itemId: string,
  input: unknown
): Promise<void> {
  await requireManagedQuiz(db, user, itemId);
  const settings = parseQuizSettings(input);
  if (!settings) throw new ValidationError('quiz.error.invalidSettings');
  await db.update(quiz).set(settings).where(eq(quiz.itemId, itemId));
}

export async function addQuestion(
  db: LearningDb,
  user: SessionUser,
  itemId: string,
  input: QuizQuestionInput
): Promise<void> {
  await requireManagedQuiz(db, user, itemId);
  const value = normalizeQuestionInput(input);
  const rows = await db.select({ id: quizQuestion.id }).from(quizQuestion).where(eq(quizQuestion.itemId, itemId));
  if (rows.length >= 100) throw new ValidationError('quiz.error.questionLimit');
  await db.insert(quizQuestion).values({
    itemId,
    position: sql`(SELECT COALESCE(MAX(position), 0) + 1 FROM quiz_question WHERE item_id = ${itemId})`,
    ...value
  });
}

export async function updateQuestion(
  db: LearningDb,
  user: SessionUser,
  itemId: string,
  questionId: string,
  input: QuizQuestionInput
): Promise<void> {
  await requireManagedQuiz(db, user, itemId);
  const value = normalizeQuestionInput(input);
  const existing = await db
    .select({ id: quizQuestion.id })
    .from(quizQuestion)
    .where(and(eq(quizQuestion.id, questionId), eq(quizQuestion.itemId, itemId)))
    .limit(1);
  if (!existing[0]) throw new NotFoundError();
  await db.update(quizQuestion).set({ ...value, updatedAt: new Date() }).where(eq(quizQuestion.id, questionId));
}

export async function saveQuestion(
  db: LearningDb,
  user: SessionUser,
  itemId: string,
  input: unknown
): Promise<void> {
  const parsed = parseQuizQuestion(input);
  if (!parsed) throw new ValidationError('quiz.error.invalidQuestion');
  if (parsed.questionId) {
    await updateQuestion(db, user, itemId, parsed.questionId, parsed);
  } else {
    await addQuestion(db, user, itemId, parsed);
  }
}

export async function deleteQuestion(
  db: LearningDb,
  user: SessionUser,
  itemId: string,
  questionId: string
): Promise<void> {
  await requireManagedQuiz(db, user, itemId);
  const existing = await db
    .select({ id: quizQuestion.id })
    .from(quizQuestion)
    .where(and(eq(quizQuestion.id, questionId), eq(quizQuestion.itemId, itemId)))
    .limit(1);
  if (!existing[0]) throw new NotFoundError();
  await db.delete(quizQuestion).where(eq(quizQuestion.id, questionId));
}

export async function moveQuestion(
  db: LearningDb,
  user: SessionUser,
  itemId: string,
  questionId: string,
  direction: 'up' | 'down'
): Promise<void> {
  await requireManagedQuiz(db, user, itemId);
  const rows = await db
    .select({ id: quizQuestion.id, position: quizQuestion.position })
    .from(quizQuestion)
    .where(eq(quizQuestion.itemId, itemId))
    .orderBy(asc(quizQuestion.position));
  const index = rows.findIndex((row) => row.id === questionId);
  if (index < 0) throw new NotFoundError();
  const neighbor = rows[index + (direction === 'up' ? -1 : 1)];
  if (!neighbor) return;
  const current = rows[index];
  await db.batch([
    db.update(quizQuestion).set({ position: neighbor.position, updatedAt: new Date() }).where(eq(quizQuestion.id, current.id)),
    db.update(quizQuestion).set({ position: current.position, updatedAt: new Date() }).where(eq(quizQuestion.id, neighbor.id))
  ]);
}

function normalizeQuestionInput(input: QuizQuestionInput) {
  let spec: unknown;
  try {
    spec = JSON.parse(input.spec) as unknown;
  } catch {
    throw new ValidationError('quiz.error.invalidSpec');
  }
  const parsed = questionSpecSchema.safeParse(spec);
  if (!parsed.success) throw new ValidationError('quiz.error.invalidSpec');
  const configJson = JSON.stringify(parsed.data.config);
  const answerKeyJson = JSON.stringify(parsed.data.answerKey);
  parseQuestionSpec(input.kind, configJson, answerKeyJson);
  return {
    kind: input.kind,
    promptMd: input.promptMd,
    points: input.points,
    explanationMd: input.explanationMd || null,
    config: configJson,
    answerKey: answerKeyJson
  };
}
