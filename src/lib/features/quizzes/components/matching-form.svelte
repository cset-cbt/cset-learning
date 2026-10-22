<script lang="ts">
  import { Select } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import { generateQuestionOptionId } from '../shared/question-id';
  import type { EditorQuestion } from '../shared/contract';
  import OptionsEditor from './options-editor.svelte';

  interface Option { id: string; text: string }
  let { question }: { question: EditorQuestion | undefined } = $props();
  let left = $state<Option[]>([]);
  let right = $state<Option[]>([]);
  let pairs = $state<Record<string, string>>({});
  let activePairs = $derived(balancedPairs(left, right, pairs));
  let spec = $derived(JSON.stringify({ config: { left, right }, answerKey: { pairs: activePairs } }));
  let rightItems = $derived(right.map((item) => ({ value: item.id, label: item.text })));

  $effect(() => {
    if (question?.kind === 'matching') {
      left = question.config.left.map((item) => ({ ...item }));
      right = question.config.right.map((item) => ({ ...item }));
      pairs = { ...question.answerKey.pairs };
    } else {
      const initialLeft = createOptions();
      const initialRight = createOptions();
      left = initialLeft;
      right = initialRight;
      pairs = Object.fromEntries(initialLeft.map((item, index) => [item.id, initialRight[index].id]));
    }
  });

  $effect(() => {
    const leftCount = left.length;
    const rightCount = right.length;
    if (leftCount > rightCount) right = resizeSide(right, leftCount);
    else if (rightCount > leftCount) left = resizeSide(left, rightCount);
  });

  function createOptions(): Option[] {
    return [0, 1].map(() => ({ id: generateQuestionOptionId(), text: '' }));
  }

  function resizeSide(items: Option[], length: number): Option[] {
    if (length < items.length) return items.slice(0, length);
    return [...items, ...Array.from({ length: length - items.length }, () => ({ id: generateQuestionOptionId(), text: '' }))];
  }

  function balancedPairs(
    leftOptions: Option[],
    rightOptions: Option[],
    current: Record<string, string>
  ): Record<string, string> {
    const next: Record<string, string> = {};
    const used: string[] = [];
    for (const item of leftOptions) {
      const existing = current[item.id];
      const chosen = rightOptions.some((option) => option.id === existing) && !used.includes(existing)
        ? existing
        : rightOptions.find((option) => !used.includes(option.id))?.id;
      if (chosen) {
        next[item.id] = chosen;
        used.push(chosen);
      }
    }
    return next;
  }

  function setPair(leftId: string, rightId: string) {
    const displaced = Object.entries(activePairs).find(([id, value]) => id !== leftId && value === rightId);
    const next = { ...activePairs, [leftId]: rightId };
    if (displaced) next[displaced[0]] = activePairs[leftId];
    pairs = next;
  }
</script>

<div class="space-y-5">
  <OptionsEditor bind:items={left} label={$t('quiz.editor.leftItems')} />
  <OptionsEditor bind:items={right} label={$t('quiz.editor.rightItems')} />
  <fieldset class="space-y-3">
    <legend class="mono-label text-xs text-ink-muted">{$t('quiz.editor.matchingAnswer')}</legend>
    {#each left as item, index (item.id)}
      <Select
        label={item.text || `${$t('quiz.editor.option')} ${index + 1}`}
        items={rightItems}
        value={activePairs[item.id] ?? ''}
        placeholder={$t('quiz.editor.selectRight')}
        onValueChange={(value) => setPair(item.id, value)}
      />
    {/each}
  </fieldset>
</div>
<input type="hidden" name="spec" value={spec} />
