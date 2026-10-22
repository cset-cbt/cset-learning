export interface RunnerTest {
  stdin: string;
  expectedStdout: string;
}

export type TestOutcome = 'ok' | 'runtime_error' | 'timeout' | 'not_run';

export interface TestRun {
  outcome: TestOutcome;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  ms: number;
}

export type RunnerPhase = 'loading' | 'compiling' | 'running';

export type RunReport =
  | { kind: 'compile_error'; message: string }
  | { kind: 'completed'; runs: TestRun[] }
  | { kind: 'runtime_unavailable'; message: string };
