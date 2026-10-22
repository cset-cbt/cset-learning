<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Card, FormMessage, InputField, Select } from 'cset-ui';
  import { z } from 'zod';
  import RuntimeStatus from '$lib/features/exercises/components/runtime-status.svelte';
  import RunResults from '$lib/features/exercises/components/run-results.svelte';
  import { createRunnerSession, type RunnerSession } from '$lib/features/exercises/runner/runner-session';
  import { isExerciseLanguage, LANGUAGE_INFO, type ExerciseLanguage } from '$lib/features/exercises/shared/languages';
  import type { ExerciseTestCase } from '$lib/features/exercises/shared/contract';
  import { t, type MessageKey } from '$lib/core/i18n';
  import type { RunReport, RunnerPhase, TestRun } from '$lib/features/exercises/shared/runner-types';

  const testsSchema = z.array(z.object({ stdin: z.string(), expectedStdout: z.string() }).strict()).max(30);
  function parseTests(text: string): ExerciseTestCase[] | null {
    try {
      const parsed = testsSchema.safeParse(JSON.parse(text));
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }
  let language = $state<ExerciseLanguage>('python');
  let source = $state('print(1)');
  let testsText = $state('[{"stdin":"","expectedStdout":"1"}]');
  let timeLimitMs = $state('3000');
  let session: RunnerSession | null = null;
  let report = $state<RunReport | null>(null);
  let partialRuns = $state<TestRun[]>([]);
  let phase = $state<RunnerPhase | null>(null);
  let elapsedMs = $state<number | null>(null);
  let runtimeLoaded = $state(false);
  let busy = $state(false);
  let errorKey = $state<MessageKey | null>(null);

  const languageItems = $derived([
    { value: 'python', label: $t('exercise.language.python') },
    { value: 'cpp', label: $t('exercise.language.cpp') },
    { value: 'java', label: $t('exercise.language.java') }
  ]);

  onMount(() => {
    session = createRunnerSession(language);
    return () => session?.dispose();
  });

  function changeLanguage(value: string) {
    if (!isExerciseLanguage(value)) return;
    session?.dispose();
    language = value;
    source = LANGUAGE_INFO[value].starter;
    session = createRunnerSession(value);
    report = null;
    runtimeLoaded = false;
  }

  async function run() {
    const tests = parseTests(testsText);
    if (!tests) {
      errorKey = 'exercise.error.invalidExercise';
      return;
    }
    if (!session || busy) return;
    busy = true;
    errorKey = null;
    report = null;
    partialRuns = [];
    const started = performance.now();
    try {
      report = await session.run({
        source,
        tests,
        timeLimitMs: Number(timeLimitMs),
        onPhase(next) {
          phase = next;
          if (next === 'compiling') runtimeLoaded = true;
        },
        onTestDone(_index, result) {
          partialRuns = [...partialRuns, result];
          report = { kind: 'completed', runs: partialRuns };
        }
      });
    } catch {
      report = { kind: 'runtime_unavailable', message: $t('exercise.error.runtimeUnavailable') };
    } finally {
      elapsedMs = Math.round(performance.now() - started);
      phase = null;
      busy = false;
    }
  }
</script>

<svelte:head>
  <title>{$t('exercise.title')}</title>
</svelte:head>

<main class="mx-auto max-w-5xl space-y-5 px-4 py-8">
  <Card>
    <div class="space-y-4">
      <h1 class="font-mono text-xl text-ink">{$t('exercise.title')}</h1>
      <Select label={$t('exercise.language')} items={languageItems} value={language} onValueChange={changeLanguage} />
      <InputField
        label={$t('exercise.editor.starterCode')}
        multiline
        rows={18}
        value={source}
        oninput={(event: Event) => {
          const target = event.target;
          if (target instanceof HTMLTextAreaElement) source = target.value;
        }}
      />
      <InputField
        label={$t('exercise.editor.tests')}
        multiline
        rows={6}
        value={testsText}
        oninput={(event: Event) => {
          const target = event.target;
          if (target instanceof HTMLTextAreaElement) testsText = target.value;
        }}
      />
      <InputField
        label={$t('exercise.editor.timeLimit')}
        type="number"
        min="500"
        max="10000"
        value={timeLimitMs}
        oninput={(event: Event) => {
          const target = event.target;
          if (target instanceof HTMLInputElement) timeLimitMs = target.value;
        }}
      />
      <RuntimeStatus {language} {phase} firstLoad={!runtimeLoaded} />
      <Button type="button" disabled={busy} onclick={() => void run()}>{$t('exercise.run')}</Button>
      {#if elapsedMs !== null}
        <p class="font-mono text-xs text-ink-muted">{$t('exercise.label.elapsed')}: {elapsedMs} ms</p>
      {/if}
      {#if errorKey}
        <FormMessage variant="error">{$t(errorKey)}</FormMessage>
      {/if}
      <RunResults {report} tests={parseTests(testsText) ?? []} />
    </div>
  </Card>
</main>
