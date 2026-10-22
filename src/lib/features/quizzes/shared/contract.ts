import type { QuizQuestionKind } from '../schema';

// Data contract between the quiz domain and the course item pages (editor and player).
export interface QuizSettings {
  passPercent: number;
  maxAttempts: number | null;
}

// What a learner may see before submitting: never the answer key or the explanation.
export interface PublicQuestion {
  id: string;
  kind: QuizQuestionKind;
  promptMd: string;
  points: number;
  config: unknown;
}

// What an editor sees: everything, including the answer key.
export interface EditorQuestion extends PublicQuestion {
  position: number;
  answerKey: unknown;
  explanationMd: string | null;
}

export interface QuizEditorData {
  settings: QuizSettings;
  questions: EditorQuestion[];
}

export interface QuizPlayerData {
  settings: QuizSettings;
  questions: PublicQuestion[];
  attemptsUsed: number;
  bestScorePercent: number | null;
}
