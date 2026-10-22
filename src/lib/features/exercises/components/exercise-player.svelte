<script lang="ts">
  import { onMount } from 'svelte';
  import { invalidateAll } from '$app/navigation';
  import { deserialize } from '$app/forms';
  import { Button, FormMessage } from 'cset-ui';
  import { isMessageKey, t, type MessageKey } from '$lib/core/i18n';
  import MarkdownContent from '$lib/features/lessons/components/markdown-content.svelte';
  import CodeEditor from './code-editor.svelte';
  import RuntimeStatus from './runtime-status.svelte';
  import RunResults from './run-results.svelte';
  import { createRunnerSession, type RunnerSession } from '../runner/runner-session';
  import type { ExercisePlayerData } from '../shared/contract';
  import type { RunReport, RunnerPhase, TestRun } from '../shared/runner-types';

  interface ExerciseResult {
    status: 'passed' | 'failed' | 'compile_error';
    passedCount: number;
    totalCount: number;
  }

  let { detail }: { detail: ExercisePlayerData } = $props();
  let session: RunnerSession | null = null;
  // eslint-disable-next-line svelte/prefer-writable-derived -- sourceCode is edited by learner in CodeEditor
  let sourceCode = $state('');
  let phase = $state<RunnerPhase | null>(null);
  let report = $state<RunReport | null>(null);
  let partialRuns = $state<TestRun[]>([]);
  let actionError = $state<MessageKey | null>(null);
  let exerciseResult = $state<ExerciseResult | null>(null);
  let isRunning = $state(false);
  let runtimeLoaded = $state(false);

  $effect(() => {
    sourceCode = detail.lastSubmission?.sourceCode ?? detail.starterCode;
  });

  onMount(() => {
    session = createRunnerSession(detail.language);
    return () => {
      session?.dispose();
      session = null;
    };
  });

  function failureKey(value: unknown): MessageKey {
    if (typeof value === 'object' && value !== null && 'error' in value) {
      const key = value.error;
      if (typeof key === 'string' && isMessageKey(key)) return key;
    }
    return 'exercise.error.submitFailed';
  }

  function readExerciseResult(value: unknown): ExerciseResult | null {
    if (typeof value !== 'object' || value === null || !('exerciseResult' in value)) return null;
    const result = value.exerciseResult;
    if (typeof result !== 'object' || result === null || !('status' in result)) return null;
    if (!('passedCount' in result) || !('totalCount' in result)) return null;
    if (result.status !== 'passed' && result.status !== 'failed' && result.status !== 'compile_error') return null;
    if (typeof result.passedCount !== 'number' || typeof result.totalCount !== 'number') return null;
    return { status: result.status, passedCount: result.passedCount, totalCount: result.totalCount };
  }

  async function execute(submit: boolean) {
    if (isRunning || detail.tests.length === 0) return;
    if (sourceCode.length > 65536) {
      actionError = 'exercise.error.sourceTooLong';
      return;
    }
    const activeSession = session;
    if (!activeSession) return;
    isRunning = true;
    actionError = null;
    exerciseResult = null;
    report = null;
    partialRuns = [];
    try {
      const result = await activeSession.run({
        source: sourceCode,
        tests: detail.tests,
        timeLimitMs: detail.timeLimitMs,
        onPhase(next) {
          phase = next;
          if (next === 'compiling') runtimeLoaded = true;
        },
        onTestDone(_index, run) {
          partialRuns = [...partialRuns, run];
          report = { kind: 'completed', runs: partialRuns };
        }
      });
      report = result;
      if (result.kind === 'runtime_unavailable') return;
      if (!submit) return;

      const payload = {
        sourceCode: sourceCode.slice(0, 65536),
        compileError: result.kind === 'compile_error' ? result.message.slice(0, 4000) : null,
        results: result.kind === 'completed'
          ? result.runs.map(({ outcome, stdout, ms }) => ({
              outcome,
              stdout: stdout.slice(0, 20000),
              ms: Math.min(Math.max(0, Math.round(ms)), 120000)
            }))
          : []
      };
      const formData = new FormData();
      formData.set('payload', JSON.stringify(payload));
      const response = await fetch('?/submit', {
        method: 'POST',
        body: formData,
        headers: { 'x-sveltekit-action': 'true' }
      });
      const actionResult = deserialize(await response.text());
      if (actionResult.type === 'failure') {
        actionError = failureKey(actionResult.data);
        return;
      }
      if (actionResult.type !== 'success') {
        actionError = 'exercise.error.submitFailed';
        return;
      }
      exerciseResult = readExerciseResult(actionResult.data);
      if (!exerciseResult) {
        actionError = 'exercise.error.submitFailed';
        return;
      }
      await invalidateAll();
    } catch {
      actionError = 'exercise.error.submitFailed';
    } finally {
      phase = null;
      isRunning = false;
    }
  }

  function runTests() {
    void execute(false);
  }

  function submitSolution() {
    void execute(true);
  }
</script>

<div class="space-y-6">
  <section class="space-y-3">
    <h2 class="font-mono text-sm text-ink">{$t('exercise.prompt')}</h2>
    <MarkdownContent source={detail.promptMd} />
  </section>

  <RuntimeStatus language={detail.language} {phase} firstLoad={!runtimeLoaded} />
  {#if detail.tests.length === 0}
    <FormMessage variant="error">{$t('exercise.error.noTests')}</FormMessage>
  {/if}
  <CodeEditor bind:value={sourceCode} language={detail.language} label={$t('exercise.editor.starterCode')} onrun={runTests} />
  <div class="flex flex-wrap gap-2">
    <Button type="button" variant="secondary" disabled={isRunning || detail.tests.length === 0} onclick={runTests}>
      {$t('exercise.run')}
    </Button>
    <Button type="button" disabled={isRunning || detail.tests.length === 0} onclick={submitSolution}>
      {$t('exercise.submit')}
    </Button>
  </div>

  {#if actionError}
    <FormMessage variant="error">{$t(actionError)}</FormMessage>
  {/if}
  {#if exerciseResult}
    <section class="space-y-2" aria-live="polite">
      <h2 class="font-mono text-sm text-ink">{$t('exercise.label.submitted')}</h2>
      <FormMessage variant={exerciseResult.status === 'passed' ? 'success' : 'error'}>
        {#if exerciseResult.status === 'passed'}
          {$t('exercise.result.passed')}
        {:else if exerciseResult.status === 'compile_error'}
          {$t('exercise.result.compileError')}
        {:else}
          {$t('exercise.result.failed', { passed: exerciseResult.passedCount, total: exerciseResult.totalCount })}
        {/if}
      </FormMessage>
    </section>
  {/if}
  <RunResults {report} tests={detail.tests} />
</div>
