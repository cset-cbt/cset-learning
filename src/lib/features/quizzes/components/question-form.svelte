<script lang="ts">
  import { InputField, Select } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import { eventValue } from '$lib/core/forms/event-value';
  import { QUESTION_KINDS } from '../shared/question-types';
  import type { EditorQuestion } from '../shared/contract';
  import type { QuizQuestionKind } from '../schema';
  import SingleChoiceForm from './single-choice-form.svelte';
  import MultipleChoiceForm from './multiple-choice-form.svelte';
  import TrueFalseForm from './true-false-form.svelte';
  import ShortAnswerForm from './short-answer-form.svelte';
  import NumericForm from './numeric-form.svelte';
  import MatchingForm from './matching-form.svelte';

  let { question }: { question: EditorQuestion | undefined } = $props();
  let kind = $state<QuizQuestionKind>('single_choice');
  let promptMd = $state('');
  let points = $state('1');
  let explanationMd = $state('');
  let kindItems = $derived(QUESTION_KINDS.map((value) => ({ value, label: $t(`quiz.kind.${value}`) })));

  $effect(() => {
    kind = question?.kind ?? 'single_choice';
    promptMd = question?.promptMd ?? '';
    points = String(question?.points ?? 1);
    explanationMd = question?.explanationMd ?? '';
  });
</script>

{#if question}
  <input type="hidden" name="questionId" value={question.id} />
{/if}
<div class="space-y-4">
  <Select label={$t('quiz.editor.questionKind')} items={kindItems} bind:value={kind} name="kind" />
  <InputField
    label={$t('quiz.editor.prompt')}
    multiline
    rows="6"
    maxlength="5000"
    name="promptMd"
    value={promptMd}
    oninput={(event: Event) => promptMd = eventValue(event)}
  />
  <InputField
    label={$t('quiz.editor.points')}
    type="number"
    min="1"
    max="100"
    step="1"
    name="points"
    value={points}
    oninput={(event: Event) => points = eventValue(event)}
  />
  <InputField
    label={$t('quiz.editor.explanation')}
    multiline
    rows="4"
    maxlength="5000"
    name="explanationMd"
    value={explanationMd}
    oninput={(event: Event) => explanationMd = eventValue(event)}
  />
  {#key kind}
    {#if kind === 'single_choice'}
      <SingleChoiceForm {question} />
    {:else if kind === 'multiple_choice'}
      <MultipleChoiceForm {question} />
    {:else if kind === 'true_false'}
      <TrueFalseForm {question} />
    {:else if kind === 'short_answer'}
      <ShortAnswerForm {question} />
    {:else if kind === 'numeric'}
      <NumericForm {question} />
    {:else}
      <MatchingForm {question} />
    {/if}
  {/key}
</div>
