import { describe, expect, it } from 'vitest';
import { formatPythonError, limitText } from '../src/lib/features/exercises/shared/format-errors';

describe('formatPythonError', () => {
  it('drops internal Pyodide frames and starts at main.py', () => {
    const message = [
      'Traceback (most recent call last):',
      '  File "_pyodide/_base.py", line 1, in run',
      '  File "main.py", line 2, in <module>',
      'ValueError: bad value'
    ].join('\n');
    expect(formatPythonError(message)).toBe([
      'Traceback (most recent call last):',
      '  File "main.py", line 2, in <module>',
      'ValueError: bad value'
    ].join('\n'));
  });

  it('returns errors unchanged without a main.py frame', () => {
    const message = 'ValueError: bad value';
    expect(formatPythonError(message)).toBe(message);
  });
});

describe('limitText', () => {
  it('truncates long text with a marker', () => {
    expect(limitText('abcdef', 3)).toBe('abc\n...(truncated)');
  });

  it('preserves short text', () => {
    expect(limitText('abc', 3)).toBe('abc');
  });
});
