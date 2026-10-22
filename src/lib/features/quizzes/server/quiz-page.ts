import type { Action } from '@sveltejs/kit';
import { z } from 'zod';
import { requireStaff, requireUser } from '$lib/core/auth/guards';
import type { SessionUser } from '$lib/core/auth/session-user';
import { actionFailure, NotFoundError, ValidationError } from '$lib/core/errors';
import type { LearningDb } from '$lib/core/db/client';
import { loadQuizForLearner, submitAttempt } from './quiz-attempt-service';
import { deleteQuestion, getQuizForEditor, moveQuestion, saveQuestion, updateQuizSettings } from './quiz-service';
import type { QuizEditorData, QuizPlayerData } from '../shared/contract';
import { parseQuizAnswers, parseQuestionActionId } from '../validation';

const directionSchema = z.enum(['up', 'down']);

export async function loadQuizEditor(
  db: LearningDb,
  user: SessionUser,
  itemId: string
): Promise<QuizEditorData> {
  return getQuizForEditor(db, user, itemId);
}

export const quizEditorActions: Record<string, Action> = {
  saveQuizSettings: async (event) => {
    try {
      const user = requireStaff(event.locals, event.url);
      const itemId = routeItemId(event.params.itemId);
      const form = await event.request.formData();
      const maxAttemptsText = field(form, 'maxAttempts');
      const questionCountText = field(form, 'questionCount');
      await updateQuizSettings(event.locals.runtime.db, user, itemId, {
        passPercent: Number(field(form, 'passPercent')),
        maxAttempts: maxAttemptsText === '' ? null : Number(maxAttemptsText),
        questionCount: questionCountText === '' ? null : Number(questionCountText),
        shuffleQuestions: form.get('shuffleQuestions') === 'on' || form.get('shuffleQuestions') === 'true',
        shuffleOptions: form.get('shuffleOptions') === 'on' || form.get('shuffleOptions') === 'true'
      });
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  saveQuestion: async (event) => {
    try {
      const user = requireStaff(event.locals, event.url);
      const itemId = routeItemId(event.params.itemId);
      const form = await event.request.formData();
      const questionId = field(form, 'questionId');
      await saveQuestion(event.locals.runtime.db, user, itemId, {
        ...(questionId ? { questionId } : {}),
        kind: field(form, 'kind'),
        promptMd: field(form, 'promptMd'),
        points: Number(field(form, 'points')),
        explanationMd: field(form, 'explanationMd') || null,
        spec: field(form, 'spec')
      });
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  deleteQuestion: async (event) => {
    try {
      const user = requireStaff(event.locals, event.url);
      const itemId = routeItemId(event.params.itemId);
      const form = await event.request.formData();
      const questionId = parseQuestionActionId(field(form, 'questionId'));
      if (!questionId) throw new ValidationError('quiz.error.invalidQuestion');
      await deleteQuestion(event.locals.runtime.db, user, itemId, questionId);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  },
  moveQuestion: async (event) => {
    try {
      const user = requireStaff(event.locals, event.url);
      const itemId = routeItemId(event.params.itemId);
      const form = await event.request.formData();
      const questionId = parseQuestionActionId(field(form, 'questionId'));
      const direction = directionSchema.safeParse(field(form, 'direction'));
      if (!questionId || !direction.success) throw new ValidationError('quiz.error.invalidQuestion');
      await moveQuestion(event.locals.runtime.db, user, itemId, questionId, direction.data);
      return { ok: true };
    } catch (cause) {
      return actionFailure(cause);
    }
  }
};

export async function loadQuizPlayer(
  db: LearningDb,
  user: SessionUser,
  itemId: string
): Promise<QuizPlayerData> {
  return loadQuizForLearner(db, user, itemId);
}

export const submitQuizAction: Action = async (event) => {
  try {
    const user = requireUser(event.locals, event.url);
    const itemId = routeItemId(event.params.itemId);
    const form = await event.request.formData();
    const answers = parseQuizAnswers(field(form, 'answers'));
    if (!answers) throw new ValidationError('quiz.error.invalidAnswers');
    const quizResult = await submitAttempt(event.locals.runtime.db, user, itemId, answers);
    return { ok: true, quizResult };
  } catch (cause) {
    return actionFailure(cause);
  }
};

function routeItemId(value: string | undefined): string {
  if (!value) throw new NotFoundError();
  return value;
}

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value : '';
}
