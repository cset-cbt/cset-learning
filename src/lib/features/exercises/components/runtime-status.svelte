<script lang="ts">
  import type { ExerciseLanguage } from '../shared/languages';
  import { LANGUAGE_INFO } from '../shared/languages';
  import type { RunnerPhase } from '../shared/runner-types';
  import { t, type MessageKey } from '$lib/core/i18n';

  let { language, phase, firstLoad }: {
    language: ExerciseLanguage;
    phase: RunnerPhase | null;
    firstLoad: boolean;
  } = $props();

  const downloadSize = $derived(LANGUAGE_INFO[language].downloadMb);
  const phaseKey = $derived<MessageKey | null>(
    phase === 'loading'
      ? 'exercise.runtime.loading'
      : phase === 'compiling'
        ? 'exercise.runtime.compiling'
        : phase === 'running'
          ? 'exercise.runtime.running'
          : null
  );
</script>

<div class="space-y-1" aria-live="polite">
  {#if firstLoad}
    <p class="text-xs text-ink-muted">{$t('exercise.runtime.firstLoad', { size: downloadSize })}</p>
  {/if}
  {#if phaseKey}
    <p class="font-mono text-xs text-accent">{$t(phaseKey)}</p>
  {/if}
</div>
