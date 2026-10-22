import type { RunnerEngine } from './engine';
import { createSandboxFrame, type SandboxFrame } from './sandbox-frame';
import { CLANG_WASM_VERSION, runtimePath } from './runtime-versions';
import { limitText } from '../shared/format-errors';
import type { TestRun } from '../shared/runner-types';
import { cppWorkerSource } from './cpp-worker-source';

import { isWorkerMessage, type WorkerMessage } from './runner-message';

type CppStartupMessage = WorkerMessage & {
  type: 'ready' | 'boot-error' | 'worker-error';
};

function isCppStartup(value: unknown): value is CppStartupMessage {
  return (
    isWorkerMessage(value, 'ready') ||
    isWorkerMessage(value, 'boot-error') ||
    isWorkerMessage(value, 'worker-error')
  );
}

export function createCppEngine(): RunnerEngine {
  let frame: SandboxFrame | null = null;
  let nextId = 1;
  let artifactReady = false;

  return {
    async load(onStatus) {
      onStatus('Loading C++ runtime');
      const base = new URL(runtimePath('clang', CLANG_WASM_VERSION), location.origin).href;
      frame = createSandboxFrame(cppWorkerSource(base), 'classic');
      const ready = await frame.waitFor(
        (value): value is { type: 'frame-ready' } => isWorkerMessage(value, 'frame-ready'),
        5000
      );
      if (ready === 'timeout') throw new Error('Sandbox frame did not start.');
      frame.send({ type: 'init' });
      const result = await frame.waitFor(isCppStartup, 180000);
      if (result === 'timeout') throw new Error('C++ runtime did not finish loading.');
      if (result.type !== 'ready') {
        const message = typeof result.error === 'string'
          ? result.error
          : typeof result.message === 'string'
            ? result.message
            : 'C++ worker failed to start.';
        throw new Error(message);
      }
    },
    async compile(source) {
      const activeFrame = frame;
      if (!activeFrame) return { ok: false, message: 'C++ runtime is unavailable.' };
      const id = nextId++;
      activeFrame.send({ type: 'compile', id, code: source });
      const result = await activeFrame.waitFor(
        (value): value is WorkerMessage => isWorkerMessage(value, 'compiled', id) || isWorkerMessage(value, 'boot-error', id),
        60000
      );
      if (result === 'timeout') {
        this.destroy();
        return { ok: false, message: 'C++ compilation timed out.' };
      }
      if (result.type === 'boot-error') return { ok: false, message: errorMessage(result) };
      artifactReady = result.ok === true;
      if (artifactReady) return { ok: true };
      const diagnostics = Array.isArray(result.diagnostics)
        ? result.diagnostics.filter((line): line is string => typeof line === 'string')
        : [];
      const filtered = diagnostics.filter((line) => !/^Error: process exited with code \d+\.$/.test(line));
      return { ok: false, message: limitText(filtered.join('\n'), 4000) };
    },
    async execute(stdin, timeLimitMs): Promise<TestRun> {
      const activeFrame = frame;
      if (!activeFrame || !artifactReady) return { outcome: 'runtime_error', stdout: '', stderr: 'Compiled program is unavailable.', exitCode: null, ms: 0 };
      const id = nextId++;
      const started = performance.now();
      activeFrame.send({ type: 'exec', id, stdin });
      const result = await activeFrame.waitFor(
        (value): value is WorkerMessage => isWorkerMessage(value, 'executed', id) || isWorkerMessage(value, 'boot-error', id),
        timeLimitMs + 1000
      );
      if (result === 'timeout') {
        this.destroy();
        return { outcome: 'timeout', stdout: '', stderr: '', exitCode: null, ms: Math.round(performance.now() - started) };
      }
      if (result.type === 'boot-error') return { outcome: 'runtime_error', stdout: '', stderr: errorMessage(result), exitCode: null, ms: Math.round(performance.now() - started) };
      const thrown = typeof result.thrown === 'string' ? `Program trapped: ${result.thrown} (crash, out of memory or abort)` : '';
      const stderr = typeof result.stderr === 'string' ? result.stderr : '';
      const exitCode = typeof result.exitCode === 'number' ? result.exitCode : null;
      return {
        outcome: thrown || exitCode !== 0 ? 'runtime_error' : 'ok',
        stdout: typeof result.stdout === 'string' ? limitText(result.stdout, 20000) : '',
        stderr: limitText(stderr + thrown, 4000),
        exitCode,
        ms: Math.round(performance.now() - started)
      };
    },
    destroy() {
      frame?.destroy();
      frame = null;
      artifactReady = false;
    }
  };
}

function errorMessage(result: WorkerMessage): string {
  return typeof result.error === 'string' ? result.error : 'C++ worker failed.';
}
