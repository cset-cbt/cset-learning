<script lang="ts">
  import { Checkbox } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import { generateQuestionOptionId } from '../shared/question-id';
  import type { EditorQuestion } from '../shared/contract';
  import OptionsEditor from './options-editor.svelte';

  interface Option { id: string; text: string }
  let { question }: { question: EditorQuestion | undefined } = $props();
  let options = $state<Option[]>([]);
  let correctOptionIds = $state<string[]>([]);
  let spec = $derived(JSON.stringify({ config: { options }, answerKey: { correctOptionIds } }));

  $effect(() => {
    if (question?.kind === 'multiple_choice') {
      options = question.config.options.map((option) => ({ ...option }));
      correctOptionIds = [...question.answerKey.correctOptionIds];
    } else {
      const initialOptions = createOptions();
      options = initialOptions;
      correctOptionIds = [initialOptions[0].id];
    }
  });

  $effect(() => {
    if (!options.length) return;
    const allowedIds = options.map((option) => option.id);
    const validIds = correctOptionIds.filter((id) => allowedIds.includes(id));
    if (validIds.length === correctOptionIds.length) return;
    correctOptionIds = validIds.length ? validIds : [options[0].id];
  });

  function createOptions(): Option[] {
    return [0, 1].map(() => ({ id: generateQuestionOptionId(), text: '' }));
  }

  function setCorrect(id: string, checked: boolean) {
    correctOptionIds = checked
      ? [...new Set([...correctOptionIds, id])]
      : correctOptionIds.filter((selected) => selected !== id);
  }
</script>

<OptionsEditor bind:items={options} label={$t('quiz.editor.options')} />
<fieldset class="space-y-2">
  <legend class="mono-label text-xs text-ink-muted">{$t('quiz.editor.correctAnswers')}</legend>
  {#each options as option (option.id)}
    <Checkbox
      checked={correctOptionIds.includes(option.id)}
      label={option.text || $t('quiz.editor.option')}
      onCheckedChange={(checked) => setCorrect(option.id, checked)}
    />
  {/each}
</fieldset>
<input type="hidden" name="spec" value={spec} />
