<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { Button, Dialog, FormMessage } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import type { EditorQuestion } from '../shared/contract';
  import QuestionForm from './question-form.svelte';

  interface Props {
    open?: boolean;
    question: EditorQuestion | undefined;
    onClose: () => void;
    onSaved: () => void;
  }

  let { open = $bindable(false), question, onClose, onSaved }: Props = $props();
  let errorMessage = $state('');

  const enhanceSave: SubmitFunction = () => {
    errorMessage = '';
    return async ({ result, update }) => {
      if (result.type === 'failure') {
        errorMessage = $t('quiz.error.invalidQuestion');
        return;
      }
      if (result.type === 'success') {
        onSaved();
        open = false;
      }
      await update();
    };
  };
</script>

<Dialog
  bind:open
  title={question ? $t('quiz.editor.editTitle') : $t('quiz.editor.addTitle')}
  size="lg"
  onOpenChange={(next) => { if (!next) onClose(); }}
>
  <form method="POST" action="?/saveQuestion" use:enhance={enhanceSave} class="max-h-[65vh] space-y-4 overflow-y-auto pr-2">
    <QuestionForm {question} />
    {#if errorMessage}
      <FormMessage variant="error">{errorMessage}</FormMessage>
    {/if}
    <div class="flex justify-end gap-2">
      <Button type="button" variant="secondary" onclick={() => { open = false; onClose(); }}>
        {$t('common.cancel')}
      </Button>
      <Button type="submit">{$t('common.save')}</Button>
    </div>
  </form>
</Dialog>
