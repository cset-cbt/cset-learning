import { describe, expect, it } from 'vitest';
import { ValidationError } from '../src/lib/core/errors';
import { parseQuestionSpec, type QuestionSpec } from '../src/lib/features/quizzes/shared/question-types';

const a = 'a0000001';
const b = 'a0000002';
const c = 'a0000003';
const d = 'a0000004';

function parse(kind: QuestionSpec['kind'], config: unknown, answerKey: unknown): QuestionSpec {
  return parseQuestionSpec(kind, JSON.stringify(config), JSON.stringify(answerKey));
}

function rejects(kind: QuestionSpec['kind'], config: unknown, answerKey: unknown) {
  expect(() => parse(kind, config, answerKey)).toThrow(ValidationError);
}

const validSpecs: [QuestionSpec['kind'], unknown, unknown][] = [
  ['single_choice', { options: [{ id: a, text: 'A' }, { id: b, text: 'B' }] }, { correctOptionId: a }],
  ['multiple_choice', { options: [{ id: a, text: 'A' }, { id: b, text: 'B' }] }, { correctOptionIds: [a] }],
  ['true_false', {}, { correct: true }],
  ['short_answer', {}, { accepted: ['yes'], caseSensitive: false }],
  ['numeric', { unit: 'kg' }, { value: 2.5, tolerance: 0 }],
  ['matching', {
    left: [{ id: a, text: 'L1' }, { id: b, text: 'L2' }],
    right: [{ id: c, text: 'R1' }, { id: d, text: 'R2' }]
  }, { pairs: { [a]: c, [b]: d } }]
];

describe('parseQuestionSpec', () => {
  it.each(validSpecs)('accepts a valid %s question specification', (kind, config, answerKey) => {
    expect(parse(kind, config, answerKey).kind).toBe(kind);
  });

  it('rejects invalid option counts, ids, and answer references', () => {
    rejects('single_choice', { options: [{ id: a, text: 'Only one' }] }, { correctOptionId: a });
    rejects('single_choice', { options: [{ id: a, text: 'A' }, { id: b, text: 'B' }] }, { correctOptionId: c });
    rejects('single_choice', { options: [{ id: a, text: 'A' }, { id: a, text: 'Duplicate' }] }, { correctOptionId: a });
  });

  it('rejects empty multiple-choice keys and invalid numeric ranges', () => {
    rejects('multiple_choice', { options: [{ id: a, text: 'A' }, { id: b, text: 'B' }] }, { correctOptionIds: [] });
    rejects('numeric', {}, { value: 2, tolerance: -1 });
    expect(() => parseQuestionSpec('numeric', '{}', '{"value":NaN,"tolerance":0}')).toThrow(ValidationError);
  });

  it('requires matching sides and a one-to-one mapping to valid right ids', () => {
    rejects('matching', { left: [{ id: a, text: 'L1' }, { id: b, text: 'L2' }], right: [{ id: c, text: 'R1' }, { id: d, text: 'R2' }, { id: 'a0000005', text: 'R3' }] }, { pairs: { [a]: c, [b]: d } });
    rejects('matching', {
      left: [{ id: a, text: 'L1' }, { id: b, text: 'L2' }], right: [{ id: c, text: 'R1' }, { id: d, text: 'R2' }]
    }, { pairs: { [a]: 'a0000005', [b]: d } });
    rejects('matching', {
      left: [{ id: a, text: 'L1' }, { id: b, text: 'L2' }], right: [{ id: c, text: 'R1' }, { id: d, text: 'R2' }]
    }, { pairs: { [a]: c, [b]: c } });
  });

  it('rejects unknown keys in strict configuration and key objects', () => {
    rejects('true_false', { extra: true }, { correct: true });
    rejects('true_false', {}, { correct: true, extra: 'ignored' });
    rejects('single_choice', { options: [{ id: a, text: 'A' }, { id: b, text: 'B', extra: 1 }] }, { correctOptionId: a });
  });

  it('rejects malformed JSON and inconsistent config-key pairs', () => {
    expect(() => parseQuestionSpec('true_false', '{', '{}')).toThrow(ValidationError);
    rejects('multiple_choice', { options: [{ id: a, text: 'A' }, { id: b, text: 'B' }] }, { correctOptionIds: [c] });
  });
});
