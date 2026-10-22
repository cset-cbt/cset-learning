import type { ExerciseLanguage } from '../shared/languages';
import type { RunReport, RunnerPhase, RunnerTest, TestRun } from '../shared/runner-types';
import type { RunnerEngine } from './engine';

export interface RunnerRequest {
  source: string;
  tests: RunnerTest[];
  timeLimitMs: number;
  onPhase?: (phase: RunnerPhase) => void;
  onTestDone?: (index: number, run: TestRun) => void;
}

export interface RunnerSession {
  run(request: RunnerRequest): Promise<RunReport>;
  dispose(): void;
}

async function createEngine(language: ExerciseLanguage): Promise<RunnerEngine> {
  switch (language) {
    case 'python':
      return (await import('./python-engine')).createPythonEngine();
    case 'cpp':
      return (await import('./cpp-engine')).createCppEngine();
    case 'java':
      return (await import('./java-engine')).createJavaEngine();
  }
}

function runtimeMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'The runtime could not start.';
}

function notRun(): TestRun {
  return { outcome: 'not_run', stdout: '', stderr: '', exitCode: null, ms: 0 };
}

export function createRunnerSession(language: ExerciseLanguage): RunnerSession {
  let engine: RunnerEngine | null = null;
  let isRunning = false;

  return {
    async run(request) {
      if (isRunning) throw new Error('A runner session already has an active execution.');
      isRunning = true;
      try {
        if (!engine) {
          try {
            engine = await createEngine(language);
            request.onPhase?.('loading');
            await engine.load(() => undefined);
          } catch (cause) {
            engine?.destroy();
            engine = null;
            return { kind: 'runtime_unavailable', message: runtimeMessage(cause) };
          }
        }

        request.onPhase?.('compiling');
        const compiled = await engine.compile(request.source);
        if (!compiled.ok) {
          if (compiled.message.includes('unavailable') || compiled.message.includes('timed out')) {
            engine.destroy();
            engine = null;
          }
          return { kind: 'compile_error', message: compiled.message };
        }

        request.onPhase?.('running');
        const runs: TestRun[] = [];
        for (let index = 0; index < request.tests.length; index += 1) {
          const test = request.tests[index];
          const result = await engine.execute(test.stdin, request.timeLimitMs);
          runs.push(result);
          request.onTestDone?.(index, result);
          if (result.outcome === 'timeout') {
            engine.destroy();
            engine = null;
            for (let remaining = index + 1; remaining < request.tests.length; remaining += 1) {
              const skipped = notRun();
              runs.push(skipped);
              request.onTestDone?.(remaining, skipped);
            }
            break;
          }
        }
        return { kind: 'completed', runs };
      } catch (cause) {
        engine?.destroy();
        engine = null;
        return { kind: 'runtime_unavailable', message: runtimeMessage(cause) };
      } finally {
        isRunning = false;
      }
    },
    dispose() {
      engine?.destroy();
      engine = null;
    }
  };
}
