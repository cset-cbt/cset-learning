import { describe, expect, it } from 'vitest';
import { submissionPayloadSchema } from '../src/lib/features/exercises/shared/submission-schema';

const validPayload = {
  sourceCode: 'print(1)',
  compileError: null,
  results: [{ outcome: 'ok', stdout: '1', ms: 4 }]
};

describe('submissionPayloadSchema', () => {
  it('rejects more than 30 test results', () => {
    expect(submissionPayloadSchema.safeParse({
      ...validPayload,
      results: Array.from({ length: 31 }, () => validPayload.results[0])
    }).success).toBe(false);
  });

  it('rejects an unknown outcome', () => {
    expect(submissionPayloadSchema.safeParse({
      ...validPayload,
      results: [{ outcome: 'passed', stdout: '1', ms: 4 }]
    }).success).toBe(false);
  });

  it('rejects a negative duration', () => {
    expect(submissionPayloadSchema.safeParse({
      ...validPayload,
      results: [{ outcome: 'ok', stdout: '1', ms: -1 }]
    }).success).toBe(false);
  });

  it('rejects source code over the size limit', () => {
    expect(submissionPayloadSchema.safeParse({
      ...validPayload,
      sourceCode: 'x'.repeat(65537)
    }).success).toBe(false);
  });

  it('rejects unknown keys', () => {
    expect(submissionPayloadSchema.safeParse({
      ...validPayload,
      passed: true
    }).success).toBe(false);
  });
});
