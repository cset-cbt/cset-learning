<script lang="ts">
  import { Badge, FormMessage } from 'cset-ui';
  import { compareOutput } from '../shared/compare-output';
  import type { ExerciseTestCase } from '../shared/contract';
  import type { RunReport, TestRun } from '../shared/runner-types';
  import { limitText } from '../shared/format-errors';
  import { t, type MessageKey } from '$lib/core/i18n';

  let { report, tests }: { report: RunReport | null; tests: ExerciseTestCase[] } = $props();

  function statusKey(run: TestRun, passed: boolean): MessageKey {
    if (passed) return 'exercise.result.status.ok';
    if (run.outcome === 'timeout') return 'exercise.result.status.timeout';
    if (run.outcome === 'runtime_error') return 'exercise.result.status.runtimeError';
    if (run.outcome === 'not_run') return 'exercise.result.status.notRun';
    return 'exercise.result.status.failed';
  }

  function statusColor(run: TestRun, passed: boolean): 'emerald' | 'amber' | 'neutral' | 'rose' {
    if (passed) return 'emerald';
    if (run.outcome === 'timeout') return 'amber';
    if (run.outcome === 'not_run') return 'neutral';
    return 'rose';
  }
</script>

{#if report}
  <section class="space-y-4" aria-live="polite">
    <h2 class="font-mono text-sm text-ink">{$t('exercise.result.title')}</h2>
    {#if report.kind === 'compile_error'}
      <FormMessage variant="error">{$t('exercise.result.compileError')}</FormMessage>
      <pre class="whitespace-pre-wrap break-words rounded-sm border border-border p-3 text-xs text-ink">{report.message}</pre>
    {:else if report.kind === 'runtime_unavailable'}
      <FormMessage variant="error">{$t('exercise.result.runtimeUnavailable')}</FormMessage>
      <pre class="whitespace-pre-wrap break-words rounded-sm border border-border p-3 text-xs text-ink">{report.message}</pre>
    {:else if tests.length === 0}
      <FormMessage variant="error">{$t('exercise.error.noTests')}</FormMessage>
    {:else}
      <div class="space-y-3">
        {#each report.runs as run, index (index)}
          {@const test = tests[index]}
          {@const passed = test !== undefined && run.outcome === 'ok' && compareOutput(test.expectedStdout, run.stdout)}
          <article class="space-y-3 rounded-sm border border-border p-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h3 class="font-mono text-xs text-ink">{$t('exercise.result.test', { number: index + 1 })}</h3>
              <div class="flex flex-wrap items-center gap-2">
                <Badge color={statusColor(run, passed)}>{$t(statusKey(run, passed))}</Badge>
                <span class="font-mono text-xs text-ink-muted">{run.ms} ms</span>
                {#if run.exitCode !== null}
                  <span class="font-mono text-xs text-ink-muted">{$t('exercise.label.exitCode')}: {run.exitCode}</span>
                {/if}
              </div>
            </div>
            {#if !passed && test}
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <p class="mono-label mb-1 text-xs text-ink-muted">{$t('exercise.result.expected')}</p>
                  <pre class="whitespace-pre-wrap break-words text-xs text-ink">{limitText(test.expectedStdout, 500)}</pre>
                </div>
                <div>
                  <p class="mono-label mb-1 text-xs text-ink-muted">{$t('exercise.result.actual')}</p>
                  <pre class="whitespace-pre-wrap break-words text-xs text-ink">{limitText(run.stdout, 500)}</pre>
                </div>
              </div>
            {/if}
            {#if run.stderr}
              <div>
                <p class="mono-label mb-1 text-xs text-ink-muted">{$t('exercise.result.stderr')}</p>
                <pre class="whitespace-pre-wrap break-words text-xs text-danger">{limitText(run.stderr, 500)}</pre>
              </div>
            {/if}
          </article>
        {/each}
      </div>
    {/if}
  </section>
{/if}
