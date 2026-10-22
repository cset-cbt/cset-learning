<script lang="ts">
  import { Select } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import { generateQuestionOptionId } from '../shared/question-id';
  import type { EditorQuestion } from '../shared/contract';
  import OptionsEditor from './options-editor.svelte';

  interface Option { id: string; text: string }
  let { question }: { question: EditorQuestion | undefined } = $props();
  let options = $state<Option[]>([]);
  let correctOptionId = $state('');
  let configItems = $derived(options.map((option) => ({ value: option.id, label: option.text })));
  let spec = $derived(JSON.stringify({ config: { options }, answerKey: { correctOptionId } }));

  $effect(() => {
    if (question?.kind === 'single_choice') {
      options = question.config.options.map((option) => ({ ...option }));
      correctOptionId = question.answerKey.correctOptionId;
    } else {
      const initialOptions = createOptions();
      options = initialOptions;
      correctOptionId = initialOptions[0].id;
    }
  });

  function createOptions(): Option[] {
    return [0, 1].map(() => ({ id: generateQuestionOptionId(), text: '' }));
  }
</script>

<OptionsEditor bind:items={options} label={$t('quiz.editor.options')} />
<Select
  label={$t('quiz.editor.correctAnswer')}
  items={configItems}
  value={correctOptionId}
  onValueChange={(value) => correctOptionId = value}
/>
<input type="hidden" name="spec" value={spec} />
