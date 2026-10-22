<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { Button, FormMessage, InputField, Select, Tabs, toast } from 'cset-ui';
  import { isMessageKey, t, type MessageKey } from '$lib/core/i18n';
  import { eventValue } from '$lib/core/forms/event-value';
  import MarkdownContent from '$lib/features/lessons/components/markdown-content.svelte';
  import CodeEditor from './code-editor.svelte';
  import TestCaseList from './test-case-list.svelte';
  import { isExerciseLanguage, LANGUAGE_INFO } from '../shared/languages';
  import type { ExerciseEditorData, ExerciseTestCase } from '../shared/contract';

  let { detail }: { detail: ExerciseEditorData } = $props();
  let language = $state<ExerciseEditorData['language']>('python');
  let promptMd = $state('');
  let starterCode = $state('');
  let timeLimitMs = $state('3000');
  let tests = $state<ExerciseTestCase[]>([]);
  let promptTab = $state('write');
  let offerStarter = $state(false);
  let actionError = $state<MessageKey | null>(null);

  $effect(() => {
    language = detail.language;
    promptMd = detail.promptMd;
    starterCode = detail.starterCode;
    timeLimitMs = String(detail.timeLimitMs);
    tests = detail.tests.map((test) => ({ ...test }));
  });

  const languageItems = $derived([
    { value: 'python', label: $t('exercise.language.python') },
    { value: 'cpp', label: $t('exercise.language.cpp') },
    { value: 'java', label: $t('exercise.language.java') }
  ]);

  function changeLanguage(value: string) {
    if (!isExerciseLanguage(value)) return;
    const unchanged = starterCode.trim() === '' || starterCode === detail.starterCode || starterCode === LANGUAGE_INFO[language].starter;
    language = value;
    if (unchanged) {
      starterCode = LANGUAGE_INFO[value].starter;
      offerStarter = false;
    } else {
      offerStarter = true;
    }
  }

  const enhanceSave: SubmitFunction = () => {
    actionError = null;
    return async ({ result, update }) => {
      if (result.type === 'success') toast.success($t('exercise.saved'));
      if (result.type === 'failure') {
        const key = result.data?.error;
        actionError = typeof key === 'string' && isMessageKey(key) ? key : 'exercise.error.invalidExercise';
      }
      await update({ reset: false });
    };
  };
</script>

<form method="POST" action="?/saveExercise" use:enhance={enhanceSave} class="space-y-6">
  <Select label={$t('exercise.language')} name="language" items={languageItems} value={language} onValueChange={changeLanguage} />

  <section class="space-y-3">
    <h2 class="font-mono text-sm text-ink">{$t('exercise.editor.prompt')}</h2>
    <Tabs bind:value={promptTab} items={[
      { value: 'write', label: $t('exercise.editor.write') },
      { value: 'preview', label: $t('exercise.editor.preview') }
    ]}>
      {#if promptTab === 'write'}
        <InputField
          label={$t('exercise.editor.prompt')}
          multiline
          rows={16}
          value={promptMd}
          oninput={(event: Event) => (promptMd = eventValue(event))}
        />
      {:else}
        <MarkdownContent source={promptMd} />
      {/if}
    </Tabs>
    <input type="hidden" name="promptMd" value={promptMd} />
  </section>

  <section class="space-y-3">
    <h2 class="font-mono text-sm text-ink">{$t('exercise.editor.starterCode')}</h2>
    <CodeEditor bind:value={starterCode} language={language} label={$t('exercise.editor.starterCode')} />
    <input type="hidden" name="starterCode" value={starterCode} />
    {#if offerStarter}
      <Button type="button" variant="secondary" onclick={() => {
        starterCode = LANGUAGE_INFO[language].starter;
        offerStarter = false;
      }}>
        {$t('exercise.editor.useStarter')}
      </Button>
    {/if}
  </section>

  <InputField
    label={$t('exercise.editor.timeLimit')}
    name="timeLimitMs"
    type="number"
    min="500"
    max="10000"
    step="1"
    required
    value={timeLimitMs}
    oninput={(event: Event) => (timeLimitMs = eventValue(event))}
  />

  <TestCaseList bind:tests />
  {#if actionError}
    <FormMessage variant="error">{$t(actionError)}</FormMessage>
  {/if}
  <Button type="submit">{$t('common.save')}</Button>
</form>
