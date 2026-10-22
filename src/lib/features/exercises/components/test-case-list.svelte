<script lang="ts">
  import { Button, InputField } from 'cset-ui';
  import { eventValue } from '$lib/core/forms/event-value';
  import { t } from '$lib/core/i18n';
  import type { ExerciseTestCase } from '../shared/contract';

  let { tests = $bindable<ExerciseTestCase[]>([]) }: { tests?: ExerciseTestCase[] } = $props();

  function update(index: number, field: keyof ExerciseTestCase, value: string) {
    tests = tests.map((test, testIndex) => testIndex === index ? { ...test, [field]: value } : test);
  }

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= tests.length) return;
    const reordered = [...tests];
    const [test] = reordered.splice(index, 1);
    reordered.splice(next, 0, test);
    tests = reordered;
  }

  function remove(index: number) {
    tests = tests.filter((_, testIndex) => testIndex !== index);
  }

  function add() {
    if (tests.length < 30) tests = [...tests, { stdin: '', expectedStdout: '' }];
  }
</script>

<div class="space-y-4">
  <input type="hidden" name="tests" value={JSON.stringify(tests)} />
  {#each tests as test, index (index)}
    <section class="space-y-3 rounded-sm border border-border p-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h3 class="font-mono text-sm text-ink">{$t('exercise.result.test', { number: index + 1 })}</h3>
        <div class="flex gap-2">
          <Button type="button" variant="secondary" disabled={index === 0} onclick={() => move(index, -1)}>{$t('common.moveUp')}</Button>
          <Button type="button" variant="secondary" disabled={index === tests.length - 1} onclick={() => move(index, 1)}>{$t('common.moveDown')}</Button>
          <Button type="button" variant="danger" onclick={() => remove(index)}>{$t('exercise.editor.removeTest')}</Button>
        </div>
      </div>
      <InputField
        label={$t('exercise.editor.stdin')}
        multiline
        rows={3}
        value={test.stdin}
        oninput={(event: Event) => update(index, 'stdin', eventValue(event))}
      />
      <InputField
        label={$t('exercise.editor.expected')}
        multiline
        rows={3}
        value={test.expectedStdout}
        oninput={(event: Event) => update(index, 'expectedStdout', eventValue(event))}
      />
    </section>
  {/each}
  <Button type="button" variant="secondary" disabled={tests.length >= 30} onclick={add}>
    {$t('exercise.editor.addTest')}
  </Button>
</div>
