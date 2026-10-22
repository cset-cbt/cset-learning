<script lang="ts">
  import { RadioGroup } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import type { EditorQuestion } from '../shared/contract';

  let { question }: { question: EditorQuestion | undefined } = $props();
  let answer = $derived(question?.kind === 'true_false' && !question.answerKey.correct ? 'false' : 'true');
  let items = $derived([
    { value: 'true', label: $t('quiz.result.true') },
    { value: 'false', label: $t('quiz.result.false') }
  ]);
  let spec = $derived(JSON.stringify({ config: {}, answerKey: { correct: answer === 'true' } }));


</script>

<RadioGroup value={answer} items={items} onValueChange={(value) => answer = value} />
<input type="hidden" name="spec" value={spec} />
