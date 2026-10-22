import { describe, expect, it } from 'vitest';
import { normalizeAnswerText } from '../src/lib/features/quizzes/shared/normalize-text';
import { parseDecimal } from '../src/lib/features/quizzes/shared/parse-decimal';

describe('normalizeAnswerText', () => {
  it('normalizes canonical Unicode, whitespace, and case by default', () => {
    expect(normalizeAnswerText('  Hà   Nội ', false)).toBe('hà nội');
    expect(normalizeAnswerText('Ha\u0300 No\u0302\u0323i', false)).toBe('hà nội');
    expect(normalizeAnswerText('A\t\nB', false)).toBe('a b');
  });

  it('keeps case when case sensitivity is requested', () => {
    expect(normalizeAnswerText('  Hà   Nội ', true)).toBe('Hà Nội');
    expect(normalizeAnswerText('hà nội', true)).not.toBe(normalizeAnswerText('Hà Nội', true));
  });
});

describe('parseDecimal', () => {
  it.each([
    ['3,14', 3.14],
    [' 1 000 ', 1000],
    ['+.5', 0.5],
    ['1e-3', 0.001]
  ])('parses %s', (value, expected) => {
    expect(parseDecimal(value)).toBe(expected);
  });

  it.each(['1.2.3', '1,2,3', '1,000.5', '1\t2', '1\n2', 'abc', 'Infinity', '', '1e999'])('rejects %s', (value) => {
    expect(parseDecimal(value)).toBeNull();
  });
});
