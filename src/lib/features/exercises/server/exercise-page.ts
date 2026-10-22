import type { Action } from '@sveltejs/kit';
import type { SessionUser } from '$lib/core/auth/session-user';
import type { LearningDb } from '$lib/core/db/client';
import type { ExerciseEditorData, ExercisePlayerData } from '../shared/contract';

// Entry points used by the course item routes. Contract (do not rename):
//  - loadExerciseEditor / loadExercisePlayer verify access themselves
//    (resolveManagedItem / resolveLearnerItem).
//  - exerciseEditorActions are merged into items/[itemId]/+page.server.ts actions (saveExercise).
//  - submitExerciseAction is dispatched by the player `submit` action for exercise items.
// Every action returns `{ ok: true, ... }` on success and uses `actionFailure` on errors.
export async function loadExerciseEditor(
  _db: LearningDb,
  _user: SessionUser,
  _itemId: string
): Promise<ExerciseEditorData> {
  throw new Error('The exercise editor is provided by the exercise runner step');
}

export const exerciseEditorActions: Record<string, Action> = {};

export async function loadExercisePlayer(
  _db: LearningDb,
  _user: SessionUser,
  _itemId: string
): Promise<ExercisePlayerData> {
  throw new Error('The exercise player is provided by the exercise runner step');
}

export const submitExerciseAction: Action = async () => {
  throw new Error('Exercise submission is provided by the exercise runner step');
};
