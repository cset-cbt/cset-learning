import { describe, expect, it } from 'vitest';
import { toPublicQuestion, toReviewItem, type QuizQuestionRow } from '../src/lib/features/quizzes/shared/to-public-question';

const a = 'a0000001';
const b = 'a0000002';
const c = 'a0000003';
const d = 'a0000004';
const explanation = 'private-explanation-marker';

const rows: QuizQuestionRow[] = [
  {
    id: 'q-single', kind: 'single_choice', promptMd: 'Question', points: 1, position: 1,
    config: JSON.stringify({ options: [{ id: a, text: 'A' }, { id: b, text: 'B' }] }),
    answerKey: JSON.stringify({ correctOptionId: a }), explanationMd: explanation
  },
  {
    id: 'q-multiple', kind: 'multiple_choice', promptMd: 'Question', points: 1, position: 2,
    config: JSON.stringify({ options: [{ id: a, text: 'A' }, { id: b, text: 'B' }] }),
    answerKey: JSON.stringify({ correctOptionIds: [a, b] }), explanationMd: explanation
  },
  {
    id: 'q-boolean', kind: 'true_false', promptMd: 'Question', points: 1, position: 3,
    config: '{}', answerKey: JSON.stringify({ correct: true }), explanationMd: explanation
  },
  {
    id: 'q-short', kind: 'short_answer', promptMd: 'Question', points: 1, position: 4,
    config: '{}', answerKey: JSON.stringify({ accepted: ['private-answer-marker'], caseSensitive: false }), explanationMd: explanation
  },
  {
    id: 'q-number', kind: 'numeric', promptMd: 'Question', points: 1, position: 5,
    config: JSON.stringify({ unit: 'kg' }), answerKey: JSON.stringify({ value: 1729, tolerance: 0.25 }), explanationMd: explanation
  },
  {
    id: 'q-match', kind: 'matching', promptMd: 'Question', points: 1, position: 6,
    config: JSON.stringify({
      left: [{ id: a, text: 'Left A' }, { id: b, text: 'Left B' }],
      right: [{ id: d, text: 'Right D' }, { id: c, text: 'Right C' }]
    }),
    answerKey: JSON.stringify({ pairs: { [a]: c, [b]: d } }), explanationMd: explanation
  }
];

describe('toPublicQuestion', () => {
  it('omits answer keys and explanations for all question kinds', () => {
    for (const row of rows) {
      const result = toPublicQuestion(row);
      const serialized = JSON.stringify(result);
      expect(Object.keys(result).sort()).toEqual(['config', 'id', 'kind', 'points', 'promptMd']);
      expect(serialized).not.toContain('answerKey');
      expect(serialized).not.toContain(explanation);
      expect(serialized).not.toContain('private-answer-marker');
      expect(serialized).not.toContain('1729');
    }
  });

  it('sorts matching right-side options independently of authored order', () => {
    const question = toPublicQuestion(rows[5]);
    expect(question.kind).toBe('matching');
    if (question.kind !== 'matching') throw new Error('Expected a matching question');
    expect(question.config.right.map((option) => option.id)).toEqual([c, d]);
    expect(JSON.stringify(question)).not.toContain('pairs');
  });

  it('derives display answers only in post-submission review projections', () => {
    const review = toReviewItem(rows[3], { questionId: rows[3].id, correct: false, earned: 0 });
    expect(review.correctAnswer).toEqual(['private-answer-marker']);
    expect(review.explanationMd).toBe(explanation);
  });
});
