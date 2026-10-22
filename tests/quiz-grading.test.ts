import { describe, expect, it } from 'vitest';
import { gradeQuestion } from '../src/lib/features/quizzes/shared/grade-question';
import { gradeQuiz } from '../src/lib/features/quizzes/shared/grade-quiz';
import type { QuestionSpec } from '../src/lib/features/quizzes/shared/question-types';

const first = 'a0000001';
const second = 'a0000002';
const third = 'a0000003';

const single: QuestionSpec = {
  kind: 'single_choice',
  config: { options: [{ id: first, text: 'A' }, { id: second, text: 'B' }] },
  answerKey: { correctOptionId: first }
};
const multiple: QuestionSpec = {
  kind: 'multiple_choice',
  config: { options: [{ id: first, text: 'A' }, { id: second, text: 'B' }, { id: third, text: 'C' }] },
  answerKey: { correctOptionIds: [first, second] }
};

const question = (id: string, spec: QuestionSpec) => ({ id, points: 1, spec });

describe('gradeQuestion', () => {
  it('grades single-choice values exactly', () => {
    expect(gradeQuestion(single, first)).toBe(true);
    expect(gradeQuestion(single, second)).toBe(false);
    expect(gradeQuestion(single, undefined)).toBe(false);
  });

  it('grades multiple-choice answers as an order-insensitive set', () => {
    expect(gradeQuestion(multiple, [second, first])).toBe(true);
    expect(gradeQuestion(multiple, [first])).toBe(false);
    expect(gradeQuestion(multiple, [first, second, third])).toBe(false);
    expect(gradeQuestion(multiple, [first, first, second])).toBe(true);
    expect(gradeQuestion(multiple, 'not-an-array')).toBe(false);
  });

  it('requires a boolean for true-false questions', () => {
    const spec: QuestionSpec = { kind: 'true_false', config: {}, answerKey: { correct: true } };
    expect(gradeQuestion(spec, true)).toBe(true);
    expect(gradeQuestion(spec, 'true')).toBe(false);
  });

  it('normalizes accepted short answers and honors case sensitivity', () => {
    const insensitive: QuestionSpec = {
      kind: 'short_answer', config: {}, answerKey: { accepted: ['Hà Nội'], caseSensitive: false }
    };
    const sensitive: QuestionSpec = {
      kind: 'short_answer', config: {}, answerKey: { accepted: ['Hà Nội'], caseSensitive: true }
    };
    expect(gradeQuestion(insensitive, '  hà   nội ')).toBe(true);
    expect(gradeQuestion(insensitive, 'Ha\u0300 No\u0302\u0323i')).toBe(true);
    expect(gradeQuestion(sensitive, 'hà nội')).toBe(false);
  });

  it('grades numeric answers with comma decimals and inclusive tolerance', () => {
    const spec: QuestionSpec = { kind: 'numeric', config: {}, answerKey: { value: 3.14, tolerance: 0.01 } };
    expect(gradeQuestion(spec, '3,14')).toBe(true);
    expect(gradeQuestion(spec, '3.15')).toBe(true);
    expect(gradeQuestion(spec, '3.16')).toBe(false);
    expect(gradeQuestion(spec, '3.14abc')).toBe(false);
    expect(gradeQuestion(spec, '1,000.5')).toBe(false);
    expect(gradeQuestion(spec, '')).toBe(false);
    expect(gradeQuestion({ ...spec, answerKey: { value: 1000, tolerance: 0 } }, '1e3')).toBe(true);
  });

  it('checks matching pairs and ignores unrelated answer keys', () => {
    const spec: QuestionSpec = {
      kind: 'matching',
      config: {
        left: [{ id: first, text: 'L1' }, { id: second, text: 'L2' }],
        right: [{ id: third, text: 'R1' }, { id: 'a0000004', text: 'R2' }]
      },
      answerKey: { pairs: { [first]: third, [second]: 'a0000004' } }
    };
    expect(gradeQuestion(spec, { [first]: third, [second]: 'a0000004' })).toBe(true);
    expect(gradeQuestion(spec, { [first]: third, [second]: 'a0000003' })).toBe(false);
    expect(gradeQuestion(spec, { [first]: third })).toBe(false);
    expect(gradeQuestion(spec, { [first]: third, [second]: 'a0000004', extra: 'ignored' })).toBe(true);
    expect(gradeQuestion(spec, null)).toBe(false);
  });
});

describe('gradeQuiz', () => {
  const questions = [question('q1', single), question('q2', single), question('q3', single)];

  it('computes rounded percentage and the passing threshold', () => {
    expect(gradeQuiz(questions, { q1: first }, 70)).toMatchObject({ scorePercent: 33, passed: false });
    expect(gradeQuiz(questions, { q1: first, q2: first }, 70)).toMatchObject({ scorePercent: 67, passed: false });
    expect(gradeQuiz(questions, { q1: first, q2: first }, 60).passed).toBe(true);
    expect(gradeQuiz(questions, { q1: first }, 33).passed).toBe(true);
  });

  it('handles empty quizzes, missing responses and unknown question ids', () => {
    expect(gradeQuiz([], {}, 70)).toMatchObject({ scorePercent: 0, passed: false, totalPoints: 0 });
    expect(gradeQuiz(questions, { unknown: first }, 70).earnedPoints).toBe(0);
    expect(gradeQuiz(questions, {}, 70).detail.every((entry) => !entry.correct)).toBe(true);
  });
});
