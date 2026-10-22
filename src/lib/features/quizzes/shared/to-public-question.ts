import type { QuizQuestionKind } from '../schema';
import type { EditorQuestion, PublicQuestion, QuizReviewAnswer, QuizReviewItem } from './contract';
import { ValidationError } from '$lib/core/errors';
import { parseQuestionConfig, parseQuestionSpec, type QuestionSpec } from './question-types';

export interface PublicQuizQuestionRow {
  id: string;
  kind: QuizQuestionKind;
  promptMd: string;
  points: number;
  config: string;
}

export interface QuizQuestionRow extends PublicQuizQuestionRow {
  position: number;
  answerKey: string;
  explanationMd: string | null;
}

export function toPublicQuestion(row: PublicQuizQuestionRow): PublicQuestion {
  const configValue = parseJson(row.config);
  const fields = { id: row.id, promptMd: row.promptMd, points: row.points };
  switch (row.kind) {
    case 'single_choice':
      return { ...fields, kind: row.kind, config: parseQuestionConfig(row.kind, configValue) };
    case 'multiple_choice':
      return { ...fields, kind: row.kind, config: parseQuestionConfig(row.kind, configValue) };
    case 'true_false':
      return { ...fields, kind: row.kind, config: parseQuestionConfig(row.kind, configValue) };
    case 'short_answer':
      return { ...fields, kind: row.kind, config: parseQuestionConfig(row.kind, configValue) };
    case 'numeric':
      return { ...fields, kind: row.kind, config: parseQuestionConfig(row.kind, configValue) };
    case 'matching': {
      const config = parseQuestionConfig(row.kind, configValue);
      return {
        ...fields,
        kind: row.kind,
        config: { ...config, right: [...config.right].sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0) }
      };
    }
  }
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    throw new ValidationError('quiz.error.invalidSpec');
  }
}

export function toEditorQuestion(row: QuizQuestionRow): EditorQuestion {
  const spec = parseQuestionSpec(row.kind, row.config, row.answerKey);
  const fields = {
    id: row.id,
    promptMd: row.promptMd,
    points: row.points,
    position: row.position,
    explanationMd: row.explanationMd
  };
  switch (spec.kind) {
    case 'single_choice': return { ...fields, kind: spec.kind, config: spec.config, answerKey: spec.answerKey };
    case 'multiple_choice': return { ...fields, kind: spec.kind, config: spec.config, answerKey: spec.answerKey };
    case 'true_false': return { ...fields, kind: spec.kind, config: spec.config, answerKey: spec.answerKey };
    case 'short_answer': return { ...fields, kind: spec.kind, config: spec.config, answerKey: spec.answerKey };
    case 'numeric': return { ...fields, kind: spec.kind, config: spec.config, answerKey: spec.answerKey };
    case 'matching': return { ...fields, kind: spec.kind, config: spec.config, answerKey: spec.answerKey };
  }
}

export function toReviewItem(
  row: QuizQuestionRow,
  detailEntry: { questionId: string; correct: boolean; earned: number }
): QuizReviewItem {
  const spec = parseQuestionSpec(row.kind, row.config, row.answerKey);
  return {
    questionId: detailEntry.questionId,
    correct: detailEntry.correct,
    earned: detailEntry.earned,
    explanationMd: row.explanationMd,
    correctAnswer: displayAnswer(spec)
  };
}

function displayAnswer(spec: QuestionSpec): QuizReviewAnswer {
  switch (spec.kind) {
    case 'single_choice':
      return spec.config.options.find((option) => option.id === spec.answerKey.correctOptionId)?.text ?? '';
    case 'multiple_choice':
      return spec.answerKey.correctOptionIds.map(
        (id) => spec.config.options.find((option) => option.id === id)?.text ?? ''
      );
    case 'true_false':
      return spec.answerKey.correct;
    case 'short_answer':
      return spec.answerKey.accepted;
    case 'numeric':
      return {
        value: spec.answerKey.value,
        tolerance: spec.answerKey.tolerance,
        ...(spec.config.unit ? { unit: spec.config.unit } : {})
      };
    case 'matching':
      return Object.entries(spec.answerKey.pairs).map(([leftId, rightId]) => ({
        left: spec.config.left.find((option) => option.id === leftId)?.text ?? '',
        right: spec.config.right.find((option) => option.id === rightId)?.text ?? ''
      }));
  }
}
