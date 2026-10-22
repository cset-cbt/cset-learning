import { z } from 'zod';

export const submissionPayloadSchema = z
  .object({
    sourceCode: z.string().max(65536),
    compileError: z.string().max(4000).nullable(),
    results: z
      .array(
        z
          .object({
            outcome: z.enum(['ok', 'runtime_error', 'timeout', 'not_run']),
            stdout: z.string().max(20000),
            ms: z.number().finite().min(0).max(120000)
          })
          .strict()
      )
      .max(30)
  })
  .strict();

export type SubmissionPayload = z.infer<typeof submissionPayloadSchema>;
