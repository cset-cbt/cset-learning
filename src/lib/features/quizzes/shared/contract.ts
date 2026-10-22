import type { QuizQuestionKind } from '../schema';
import type { QuestionAnswerKeyMap, QuestionConfigMap } from './question-types';

export interface QuizSettings {
  passPercent: number;
  maxAttempts: number | null;
  questionCount?: number | null;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
}

type PublicQuestionFor<K extends QuizQuestionKind> = {
  id: string;
  kind: K;
  promptMd: string;
  points: number;
  config: QuestionConfigMap[K];
};

export type PublicQuestion = {
  [K in QuizQuestionKind]: PublicQuestionFor<K>;
}[QuizQuestionKind];

export type EditorQuestion = {
  [K in QuizQuestionKind]: PublicQuestionFor<K> & {
    position: number;
    answerKey: QuestionAnswerKeyMap[K];
    explanationMd: string | null;
  };
}[QuizQuestionKind];

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

export type QuizReviewAnswer =
  | string
  | string[]
  | boolean
  | { value: number; tolerance: number; unit?: string }
  | { left: string; right: string }[];

export interface QuizReviewItem {
  questionId: string;
  correct: boolean;
  earned: number;
  explanationMd: string | null;
  correctAnswer: QuizReviewAnswer;
}

export interface QuizResult {
  earnedPoints: number;
  totalPoints: number;
  scorePercent: number;
  passed: boolean;
  attemptsUsed: number;
  maxAttempts: number | null;
  bestScorePercent: number;
  review: QuizReviewItem[];
}
