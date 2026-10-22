<script lang="ts">
  import { InputField } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import { eventValue } from '$lib/core/forms/event-value';
  import type { EditorQuestion } from '../shared/contract';

  let { question }: { question: EditorQuestion | undefined } = $props();
  let value = $state('');
  let tolerance = $state('0');
  let unit = $state('');
  let numericValue = $derived(value.trim() ? Number(value) : Number.NaN);
  let numericTolerance = $derived(tolerance.trim() ? Number(tolerance) : Number.NaN);
  let config = $derived(unit ? { unit } : {});
  let spec = $derived(JSON.stringify({ config, answerKey: { value: numericValue, tolerance: numericTolerance } }));

  $effect(() => {
    if (question?.kind === 'numeric') {
      value = String(question.answerKey.value);
      tolerance = String(question.answerKey.tolerance);
      unit = question.config.unit ?? '';
    } else {
      value = '';
      tolerance = '0';
      unit = '';
    }
  });
</script>

<div class="grid gap-4 sm:grid-cols-2">
  <InputField
    label={$t('quiz.editor.numericValue')}
    type="number"
    step="any"
    value={value}
    oninput={(event: Event) => value = eventValue(event)}
  />
  <InputField
    label={$t('quiz.editor.tolerance')}
    type="number"
    min="0"
    step="any"
    value={tolerance}
    oninput={(event: Event) => tolerance = eventValue(event)}
  />
</div>
<InputField
  label={$t('quiz.editor.unit')}
  value={unit}
  maxlength="100"
  oninput={(event: Event) => unit = eventValue(event)}
/>
<input type="hidden" name="spec" value={spec} />
