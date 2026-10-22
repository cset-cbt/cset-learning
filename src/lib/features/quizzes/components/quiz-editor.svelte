<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { Button, Card, FormMessage, InputField, toast } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import { eventValue } from '$lib/core/forms/event-value';
  import type { EditorQuestion, QuizEditorData } from '../shared/contract';
  import QuestionDialog from './question-dialog.svelte';
  import QuestionList from './question-list.svelte';

  let { detail }: { detail: QuizEditorData } = $props();
  let passPercent = $state('');
  let maxAttempts = $state('');
  $effect(() => {
    passPercent = String(detail.settings.passPercent);
    maxAttempts = detail.settings.maxAttempts === null ? '' : String(detail.settings.maxAttempts);
  });
  let settingsError = $state(false);
  let dialogOpen = $state(false);
  let activeQuestion = $state<EditorQuestion | undefined>(undefined);

  const enhanceSettings: SubmitFunction = () => {
    settingsError = false;
    return async ({ result, update }) => {
      if (result.type === 'failure') {
        settingsError = true;
        return;
      }
      if (result.type === 'success') toast.success($t('common.saved'));
      await update();
    };
  };

  function newQuestion() {
    activeQuestion = undefined;
    dialogOpen = true;
  }

  function editQuestion(question: EditorQuestion) {
    activeQuestion = question;
    dialogOpen = true;
  }

  function closeDialog() {
    dialogOpen = false;
    activeQuestion = undefined;
  }

  function savedQuestion() {
    toast.success($t('common.saved'));
    closeDialog();
  }
</script>

<div class="space-y-8">
  <Card>
    <form method="POST" action="?/saveQuizSettings" use:enhance={enhanceSettings} class="space-y-4">
      <h2 class="text-xl font-semibold text-ink">{$t('quiz.editor.settings')}</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <InputField
          label={$t('quiz.editor.passPercent')}
          type="number"
          min="1"
          max="100"
          step="1"
          name="passPercent"
          value={passPercent}
          oninput={(event: Event) => passPercent = eventValue(event)}
        />
        <div class="space-y-1">
          <InputField
            label={$t('quiz.editor.maxAttempts')}
            type="number"
            min="1"
            max="100"
            step="1"
            name="maxAttempts"
            value={maxAttempts}
            oninput={(event: Event) => maxAttempts = eventValue(event)}
          />
          <p class="text-xs text-ink-muted">{$t('quiz.editor.unlimited')}</p>
        </div>
      </div>
      {#if settingsError}
        <FormMessage variant="error">{$t('quiz.error.invalidSettings')}</FormMessage>
      {/if}
      <Button type="submit">{$t('common.save')}</Button>
    </form>
  </Card>

  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-xl font-semibold text-ink">{$t('quiz.editor.questions')}</h2>
      <Button type="button" onclick={newQuestion}>{$t('quiz.editor.addQuestion')}</Button>
    </div>
    <QuestionList questions={detail.questions} onEdit={editQuestion} />
  </section>
</div>

<QuestionDialog
  bind:open={dialogOpen}
  question={activeQuestion}
  onClose={closeDialog}
  onSaved={savedQuestion}
/>
