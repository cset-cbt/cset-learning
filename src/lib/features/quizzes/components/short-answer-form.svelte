<script lang="ts">
  import { Checkbox, InputField } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import { eventValue } from '$lib/core/forms/event-value';
  import type { EditorQuestion } from '../shared/contract';

  let { question }: { question: EditorQuestion | undefined } = $props();
  let accepted = $state(['']);
  let caseSensitive = $state(false);
  let value = $derived(accepted.filter((entry) => entry.length > 0));
  let spec = $derived(JSON.stringify({ config: {}, answerKey: { accepted: value, caseSensitive } }));

  $effect(() => {
    if (question?.kind === 'short_answer') {
      accepted = [...question.answerKey.accepted];
      caseSensitive = question.answerKey.caseSensitive;
    } else {
      accepted = [''];
      caseSensitive = false;
    }
  });
</script>

<InputField
  label={$t('quiz.editor.acceptedAnswers')}
  multiline
  value={accepted.join('\n')}
  maxlength="2000"
  oninput={(event: Event) => accepted = eventValue(event).split('\n').slice(0, 10)}
/>
<Checkbox bind:checked={caseSensitive} label={$t('quiz.editor.caseSensitive')} />
<input type="hidden" name="spec" value={spec} />
