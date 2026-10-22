import type { TestRun } from '../shared/runner-types';

export interface RunnerEngine {
  load(onStatus: (message: string) => void): Promise<void>;
  compile(source: string): Promise<{ ok: true } | { ok: false; message: string }>;
  execute(stdin: string, timeLimitMs: number): Promise<TestRun>;
  destroy(): void;
}
