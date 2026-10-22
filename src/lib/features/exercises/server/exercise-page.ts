import type { Action } from '@sveltejs/kit';
import type { SessionUser } from '$lib/core/auth/session-user';
import { requireStaff, requireUser } from '$lib/core/auth/guards';
import type { LearningDb } from '$lib/core/db/client';
import { actionFailure, NotFoundError, ValidationError } from '$lib/core/errors';
import { parseExerciseInput } from '../shared/validation';
import type { ExerciseEditorData, ExercisePlayerData } from '../shared/contract';
import { getExerciseForEditor, loadExerciseForLearner, saveExercise } from './exercise-service';
import { submitExercise } from './submission-service';

export async function loadExerciseEditor(
  db: LearningDb,
  user: SessionUser,
  itemId: string
): Promise<ExerciseEditorData> {
  return getExerciseForEditor(db, user, itemId);
}

function stringField(data: FormData, name: string): string {
  const value = data.get(name);
  if (typeof value !== 'string') throw new ValidationError('exercise.error.invalidExercise');
  return value;
}

function parseTests(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    throw new ValidationError('exercise.error.invalidExercise');
  }
}

const saveExerciseAction: Action = async (event) => {
  try {
    const user = requireStaff(event.locals, event.url);
    const itemId = event.params.itemId;
    if (!itemId) throw new NotFoundError();
    const data = await event.request.formData();
    const input = parseExerciseInput({
      language: stringField(data, 'language'),
      promptMd: stringField(data, 'promptMd'),
      starterCode: stringField(data, 'starterCode'),
      timeLimitMs: Number(stringField(data, 'timeLimitMs')),
      tests: parseTests(stringField(data, 'tests'))
    });
    await saveExercise(event.locals.runtime.db, user, itemId, input);
    return { ok: true };
  } catch (cause) {
    return actionFailure(cause);
  }
};

export const exerciseEditorActions: Record<string, Action> = {
  saveExercise: saveExerciseAction
};

export async function loadExercisePlayer(
  db: LearningDb,
  user: SessionUser,
  itemId: string
): Promise<ExercisePlayerData> {
  return loadExerciseForLearner(db, user, itemId);
}

export const submitExerciseAction: Action = async (event) => {
  try {
    const user = requireUser(event.locals, event.url);
    const itemId = event.params.itemId;
    if (!itemId) throw new NotFoundError();
    const data = await event.request.formData();
    const payload = stringField(data, 'payload');
    const exerciseResult = await submitExercise(event.locals.runtime.db, user, itemId, payload);
    return { ok: true, exerciseResult };
  } catch (cause) {
    return actionFailure(cause);
  }
};
