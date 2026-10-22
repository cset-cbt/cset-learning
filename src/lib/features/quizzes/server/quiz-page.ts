import type { Action } from '@sveltejs/kit';
import type { SessionUser } from '$lib/core/auth/session-user';
import type { LearningDb } from '$lib/core/db/client';
import type { QuizEditorData, QuizPlayerData } from '../shared/contract';

// Entry points used by the course item routes. Contract (do not rename):
//  - loadQuizEditor / loadQuizPlayer verify access themselves (resolveManagedItem / resolveLearnerItem).
//  - quizEditorActions are merged into items/[itemId]/+page.server.ts actions
//    (saveQuizSettings, saveQuestion, deleteQuestion, moveQuestion).
//  - submitQuizAction is dispatched by the player `submit` action for quiz items.
// Every action returns `{ ok: true, ... }` on success and uses `actionFailure` on errors.
export async function loadQuizEditor(
  _db: LearningDb,
  _user: SessionUser,
  _itemId: string
): Promise<QuizEditorData> {
  throw new Error('The quiz editor is provided by the quiz engine step');
}

export const quizEditorActions: Record<string, Action> = {};

export async function loadQuizPlayer(
  _db: LearningDb,
  _user: SessionUser,
  _itemId: string
): Promise<QuizPlayerData> {
  throw new Error('The quiz player is provided by the quiz engine step');
}

export const submitQuizAction: Action = async () => {
  throw new Error('Quiz submission is provided by the quiz engine step');
};
