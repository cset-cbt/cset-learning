import { describe, expect, it } from 'vitest';
import { compareOutput } from '../src/lib/features/exercises/shared/compare-output';

describe('compareOutput', () => {
  it.each([
    ['1\n2\n', '1\r\n2', true],
    ['1 \n2', '1\n2', true],
    ['1\n\n\n', '1', true],
    ['', '\n', true],
    ['1  2', '1 2', false],
    ['a', 'A', false],
    ['a\nb', 'a b', false],
    ['\n1', '1', false]
  ])('compares %j with %j', (expected, actual, same) => {
    expect(compareOutput(expected, actual)).toBe(same);
  });
});
