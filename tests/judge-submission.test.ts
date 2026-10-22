import { describe, expect, it } from 'vitest';
import { ValidationError } from '../src/lib/core/errors';
import { judgeSubmission } from '../src/lib/features/exercises/shared/judge-submission';
import type { SubmissionPayload } from '../src/lib/features/exercises/shared/submission-schema';

const tests = [{ expectedStdout: 'one' }, { expectedStdout: 'two' }];

function payload(results: SubmissionPayload['results']): SubmissionPayload {
  return { sourceCode: 'print(1)', compileError: null, results };
}

describe('judgeSubmission', () => {
  it('passes when every reported output matches', () => {
    expect(judgeSubmission(tests, payload([
      { outcome: 'ok', stdout: 'one\n', ms: 3 },
      { outcome: 'ok', stdout: 'two', ms: 4 }
    ]))).toMatchObject({ status: 'passed', passedCount: 2, totalCount: 2 });
  });

  it('fails when one output differs', () => {
    expect(judgeSubmission(tests, payload([
      { outcome: 'ok', stdout: 'one', ms: 2 },
      { outcome: 'ok', stdout: 'wrong', ms: 3 }
    ]))).toMatchObject({ status: 'failed', passedCount: 1, totalCount: 2 });
  });

  it('does not accept matching output from a timed out run', () => {
    expect(judgeSubmission([tests[0]], payload([
      { outcome: 'timeout', stdout: 'one', ms: 12000 }
    ]))).toMatchObject({ status: 'failed', passedCount: 0, totalCount: 1 });
  });

  it('stores compiler failures as unrun cases', () => {
    expect(judgeSubmission(tests, {
      sourceCode: 'invalid',
      compileError: 'compiler diagnostic',
      results: []
    })).toMatchObject({
      status: 'compile_error',
      passedCount: 0,
      totalCount: 2,
      detail: [
        { outcome: 'not_run', passed: false },
        { outcome: 'not_run', passed: false }
      ]
    });
  });

  it('rejects a result count that differs from the stored tests', () => {
    expect(() => judgeSubmission(tests, payload([
      { outcome: 'ok', stdout: 'one', ms: 1 }
    ]))).toThrow(ValidationError);
  });

  it('fails exercises with no tests', () => {
    expect(judgeSubmission([], payload([]))).toMatchObject({
      status: 'failed',
      passedCount: 0,
      totalCount: 0
    });
  });
});
