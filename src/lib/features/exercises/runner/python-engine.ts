import type { RunnerEngine } from './engine';
import { createSandboxFrame, type SandboxFrame } from './sandbox-frame';
import { PYODIDE_VERSION, runtimePath } from './runtime-versions';
import { formatPythonError, limitText } from '../shared/format-errors';
import type { TestRun } from '../shared/runner-types';
import { pythonWorkerSource } from './python-worker-source';
import { isWorkerMessage, type WorkerMessage } from './runner-message';

interface PythonResult extends WorkerMessage {
  type: 'result';
  id: number;
  stdout: string;
  stderr: string;
  exitCode: number;
  errorText: string | null;
}

type PythonStartupMessage = WorkerMessage & {
  type: 'ready' | 'boot-error' | 'worker-error';
};

function isPythonResult(value: unknown, id: number): value is PythonResult {
  return (
    isWorkerMessage(value, 'result', id) &&
    typeof value.id === 'number' &&
    typeof value.stdout === 'string' &&
    typeof value.stderr === 'string' &&
    typeof value.exitCode === 'number' &&
    (typeof value.errorText === 'string' || value.errorText === null)
  );
}

function isPythonStartup(value: unknown): value is PythonStartupMessage {
  return (
    isWorkerMessage(value, 'ready') ||
    isWorkerMessage(value, 'boot-error') ||
    isWorkerMessage(value, 'worker-error')
  );
}

export function createPythonEngine(): RunnerEngine {
  let frame: SandboxFrame | null = null;
  let nextId = 1;
  let currentSource = '';

  return {
    async load(onStatus) {
      onStatus('Loading Python runtime');
      const base = new URL(runtimePath('pyodide', PYODIDE_VERSION), location.origin).href;
      frame = createSandboxFrame(pythonWorkerSource(base), 'module');
      const ready = await frame.waitFor(
        (value): value is { type: 'frame-ready' } => isWorkerMessage(value, 'frame-ready'),
        5000
      );
      if (ready === 'timeout') throw new Error('Sandbox frame did not start.');
      frame.send({ type: 'init' });
      const result = await frame.waitFor(isPythonStartup, 120000);
      if (result === 'timeout') throw new Error('Python runtime did not finish loading.');
      if (result.type !== 'ready') {
        const message = typeof result.error === 'string'
          ? result.error
          : typeof result.message === 'string'
            ? result.message
            : 'Python worker failed to start.';
        throw new Error(message);
      }
    },
    async compile(source) {
      currentSource = source;
      return { ok: true };
    },
    async execute(stdin, timeLimitMs): Promise<TestRun> {
      const activeFrame = frame;
      if (!activeFrame) return { outcome: 'runtime_error', stdout: '', stderr: 'Python runtime is unavailable.', exitCode: null, ms: 0 };
      const id = nextId++;
      const started = performance.now();
      activeFrame.send({ type: 'run', id, code: currentSource, stdin });
      const response = await activeFrame.waitFor((value): value is PythonResult => isPythonResult(value, id), timeLimitMs + 1000);
      if (response === 'timeout') {
        this.destroy();
        return { outcome: 'timeout', stdout: '', stderr: '', exitCode: null, ms: Math.round(performance.now() - started) };
      }
      const error = response.errorText ? `${formatPythonError(response.errorText)}\n` : '';
      return {
        outcome: response.exitCode === 0 ? 'ok' : 'runtime_error',
        stdout: limitText(response.stdout, 20000),
        stderr: limitText(error + response.stderr, 4000),
        exitCode: response.exitCode,
        ms: Math.round(performance.now() - started)
      };
    },
    destroy() {
      frame?.destroy();
      frame = null;
    }
  };

}
