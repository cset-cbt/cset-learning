import { ValidationError } from '$lib/core/errors';
import { compareOutput } from './compare-output';
import type { TestOutcome } from './runner-types';
import type { SubmissionPayload } from './submission-schema';

export interface SubmissionJudgment {
  status: 'passed' | 'failed' | 'compile_error';
  passedCount: number;
  totalCount: number;
  detail: { outcome: TestOutcome; passed: boolean; ms: number }[];
  message: string | null;
}

export function judgeSubmission(
  tests: { expectedStdout: string }[],
  payload: SubmissionPayload
): SubmissionJudgment {
  const totalCount = tests.length;
  if (payload.compileError !== null) {
    return {
      status: 'compile_error',
      passedCount: 0,
      totalCount,
      detail: tests.map(() => ({ outcome: 'not_run', passed: false, ms: 0 })),
      message: payload.compileError
    };
  }
  if (payload.results.length !== totalCount) {
    throw new ValidationError('exercise.error.resultsMismatch');
  }

  const detail = payload.results.map((result, index) => ({
    outcome: result.outcome,
    passed: result.outcome === 'ok' && compareOutput(tests[index].expectedStdout, result.stdout),
    ms: result.ms
  }));
  const passedCount = detail.filter((entry) => entry.passed).length;
  return {
    status: totalCount > 0 && passedCount === totalCount ? 'passed' : 'failed',
    passedCount,
    totalCount,
    detail,
    message: null
  };
}
