import { and, count, eq, max } from 'drizzle-orm';
import { z } from 'zod';
import type { SessionUser } from '$lib/core/auth/session-user';
import type { LearningDb } from '$lib/core/db/client';
import { itemProgress, quiz, quizAttempt, quizQuestion } from '$lib/core/db/schema';
import { NotFoundError, ValidationError } from '$lib/core/errors';
import { resolveLearnerItem } from '$lib/features/courses/server/item-access';
import type { QuizPlayerData, QuizResult } from '../shared/contract';
import { gradeQuiz } from '../shared/grade-quiz';
import { parseQuestionSpec } from '../shared/question-types';
import { toPublicQuestion, toReviewItem } from '../shared/to-public-question';

const answersSchema = z.record(z.string(), z.unknown()).superRefine((answers, context) => {
  if (Object.keys(answers).length > 100) context.addIssue({ code: 'custom', message: 'Too many answers' });
});

async function requireLearnerQuiz(db: LearningDb, user: SessionUser, itemId: string) {
  const { item } = await resolveLearnerItem(db, user, itemId);
  if (item.type !== 'quiz') throw new NotFoundError();
  const rows = await db.select().from(quiz).where(eq(quiz.itemId, itemId)).limit(1);
  if (!rows[0]) throw new NotFoundError();
  return rows[0];
}

export async function loadQuizForLearner(
  db: LearningDb,
  user: SessionUser,
  itemId: string
): Promise<QuizPlayerData> {
  const settings = await requireLearnerQuiz(db, user, itemId);
  const questions = await db
    .select({ id: quizQuestion.id, kind: quizQuestion.kind, promptMd: quizQuestion.promptMd,
      points: quizQuestion.points, config: quizQuestion.config })
    .from(quizQuestion)
    .where(eq(quizQuestion.itemId, itemId))
    .orderBy(quizQuestion.position);
  const stats = await db
    .select({ attemptsUsed: count(), bestScorePercent: max(quizAttempt.scorePercent) })
    .from(quizAttempt)
    .where(and(eq(quizAttempt.userId, user.id), eq(quizAttempt.itemId, itemId)));
  return {
    settings: { passPercent: settings.passPercent, maxAttempts: settings.maxAttempts },
    questions: questions.map(toPublicQuestion),
    attemptsUsed: stats[0]?.attemptsUsed ?? 0,
    bestScorePercent: stats[0]?.bestScorePercent ?? null
  };
}

export async function submitAttempt(
  db: LearningDb,
  user: SessionUser,
  itemId: string,
  rawAnswers: unknown
): Promise<QuizResult> {
  const settings = await requireLearnerQuiz(db, user, itemId);
  const parsedAnswers = answersSchema.safeParse(rawAnswers);
  if (!parsedAnswers.success || JSON.stringify(parsedAnswers.data).length > 20000) {
    throw new ValidationError('quiz.error.invalidAnswers');
  }
  const stats = await db
    .select({ attemptsUsed: count(), bestScorePercent: max(quizAttempt.scorePercent) })
    .from(quizAttempt)
    .where(and(eq(quizAttempt.userId, user.id), eq(quizAttempt.itemId, itemId)));
  const attemptsUsed = stats[0]?.attemptsUsed ?? 0;
  if (settings.maxAttempts !== null && attemptsUsed >= settings.maxAttempts) {
    throw new ValidationError('quiz.error.attemptsExhausted');
  }

  const questionRows = await db
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
    .orderBy(quizQuestion.position);
  const grade = gradeQuiz(
    questionRows.map((row) => ({
      id: row.id,
      points: row.points,
      spec: parseQuestionSpec(row.kind, row.config, row.answerKey)
    })),
    parsedAnswers.data,
    settings.passPercent
  );
  const attemptStatement = db.insert(quizAttempt).values({
    itemId,
    userId: user.id,
    answers: JSON.stringify(parsedAnswers.data),
    detail: JSON.stringify(grade.detail),
    earnedPoints: grade.earnedPoints,
    totalPoints: grade.totalPoints,
    scorePercent: grade.scorePercent,
    passed: grade.passed
  });
  if (grade.passed) {
    await db.batch([
      attemptStatement,
      db.insert(itemProgress).values({ userId: user.id, itemId }).onConflictDoNothing()
    ]);
  } else {
    await db.batch([attemptStatement]);
  }

  const bestScorePercent = Math.max(stats[0]?.bestScorePercent ?? 0, grade.scorePercent);
  return {
    ...grade,
    attemptsUsed: attemptsUsed + 1,
    maxAttempts: settings.maxAttempts,
    bestScorePercent,
    review: questionRows.map((row, index) => toReviewItem(row, grade.detail[index]))
  };
}
