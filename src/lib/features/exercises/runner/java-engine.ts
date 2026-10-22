import { get } from 'svelte/store';
import type {
  TraceJVMCompileResult,
  TraceJVMCompiledProgram,
  TraceJVMCompilerWorkerClient,
  TraceJVMWorkerClient,
  TraceJVMWorkerLike
} from '@tracecode/tracejvm';
import { locale, translate } from '$lib/core/i18n';
import type { RunnerEngine } from './engine';
import { JAVA_HARNESS } from './java-harness';
import { TRACEJVM_VERSION, runtimePath } from './runtime-versions';
import { limitText } from '../shared/format-errors';
import type { TestRun } from '../shared/runner-types';

function diagnosticText(result: TraceJVMCompileResult): string {
  const missingMain = translate(get(locale), 'exercise.error.javaMainMissing');
  const diagnostics = result.diagnostics.map((diagnostic) =>
    diagnostic.fileName === 'CsetHarness.java'
      ? missingMain
      : `${diagnostic.fileName ?? 'Main.java'}:${diagnostic.lineNumber ?? 0}:${diagnostic.columnNumber ?? 0}: ${diagnostic.message}`
  );
  return diagnostics.length > 0 ? diagnostics.join('\n') : result.stderr;
}

function runtimeError(message: string, ms = 0): TestRun {
  return { outcome: 'runtime_error', stdout: '', stderr: limitText(message, 4000), exitCode: null, ms };
}

export function createJavaEngine(): RunnerEngine {
  let compiler: TraceJVMCompilerWorkerClient | null = null;
  let runner: TraceJVMWorkerClient | null = null;
  let program: TraceJVMCompiledProgram | null = null;

  return {
    async load(onStatus) {
      onStatus('Loading Java compiler');
      const { TraceJVMCompilerWorkerClient } = await import('@tracecode/tracejvm');
      const runtimeBase = new URL(runtimePath('tracejvm', TRACEJVM_VERSION), location.origin).href.replace(/\/$/, '');
      const createWorker = () => new Worker(`${runtimeBase}/browser-worker.js`, { type: 'module' }) as unknown as TraceJVMWorkerLike;
      compiler = new TraceJVMCompilerWorkerClient({
        compiler: {
          assets: { baseUrl: `${runtimeBase}/compiler` },
          platformArchiveUrl: `${runtimeBase}/profiles/core/jdk23.jar`
        },
        createWorker
      });
      await compiler.initialize();
    },
    async compile(source) {
      if (!compiler) return { ok: false, message: 'Java compiler is unavailable.' };
      const result = await compiler.compile({
        sources: [
          { path: 'Main.java', content: source },
          { path: 'CsetHarness.java', content: JAVA_HARNESS }
        ]
      });
      if (result.status !== 'completed' || !result.program) {
        return { ok: false, message: limitText(diagnosticText(result), 4000) };
      }
      program = result.program;
      return { ok: true };
    },
    async execute(stdin, timeLimitMs): Promise<TestRun> {
      if (!program || !compiler) return runtimeError('Java program is unavailable.');
      try {
        if (!runner) {
          const { TraceJVMWorkerClient } = await import('@tracecode/tracejvm');
          const runtimeBase = new URL(runtimePath('tracejvm', TRACEJVM_VERSION), location.origin).href.replace(/\/$/, '');
          const createWorker = () => new Worker(`${runtimeBase}/browser-worker.js`, { type: 'module' }) as unknown as TraceJVMWorkerLike;
          runner = new TraceJVMWorkerClient({
            engine: {
              assets: {
                runtimeProfileBaseUrls: { core: `${runtimeBase}/profiles/core` },
                wasmUrl: `${runtimeBase}/bjvm_main.wasm`
              }
            },
            createWorker,
            hardAbort: true
          });
          await runner.initialize();
        }
      } catch (cause) {
        return runtimeError(cause instanceof Error ? cause.message : 'Java runtime failed to initialize.');
      }

      const activeRunner = runner;
      const controller = new AbortController();
      const started = performance.now();
      const timer = setTimeout(() => controller.abort(), timeLimitMs);
      try {
        const result = await activeRunner.run({
          program,
          mainClass: 'CsetHarness',
          args: [stdin],
          signal: controller.signal
        });
        const ms = Math.round(performance.now() - started);
        if (controller.signal.aborted || result.status === 'cancelled') {
          activeRunner.terminate();
          runner = null;
          return { outcome: 'timeout', stdout: '', stderr: '', exitCode: null, ms };
        }
        if (result.retirementRecommended || result.isolation.status !== 'clean') {
          activeRunner.terminate();
          runner = null;
        }
        return {
          outcome: result.status === 'completed' && result.exitCode === 0 ? 'ok' : 'runtime_error',
          stdout: limitText(result.stdout, 20000),
          stderr: limitText(result.stderr, 4000),
          exitCode: result.exitCode,
          ms
        };
      } catch (cause) {
        if (controller.signal.aborted) {
          activeRunner.terminate();
          runner = null;
          return { outcome: 'timeout', stdout: '', stderr: '', exitCode: null, ms: Math.round(performance.now() - started) };
        }
        return runtimeError(cause instanceof Error ? cause.message : 'Java execution failed.', Math.round(performance.now() - started));
      } finally {
        clearTimeout(timer);
      }
    },
    destroy() {
      runner?.terminate();
      compiler?.terminate();
      runner = null;
      compiler = null;
      program = null;
    }
  };
}
