<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { Badge, Button, Card, Checkbox, FormMessage, InputField, RadioGroup, Select } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import { eventValue } from '$lib/core/forms/event-value';
  import type { QuizPlayerData, QuizResult } from '../shared/contract';
  import MarkdownContent from '$lib/features/lessons/components/markdown-content.svelte';
  import QuizResultView from './quiz-result.svelte';

  let { detail }: { detail: QuizPlayerData } = $props();
  let answers = $state<Record<string, unknown>>({});
  let quizResult = $state<QuizResult | null>(null);
  let actionError = $state('');
  let submitting = $state(false);
  let answersJson = $derived(JSON.stringify(answers));
  let attemptsExhausted = $derived(
    detail.settings.maxAttempts !== null && detail.attemptsUsed >= detail.settings.maxAttempts
  );

  function setAnswer(questionId: string, answer: unknown) {
    answers = { ...answers, [questionId]: answer };
  }

  function stringAnswer(questionId: string): string {
    const value = answers[questionId];
    return typeof value === 'string' ? value : '';
  }

  function selectedAnswers(questionId: string): string[] {
    const value = answers[questionId];
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
  }

  function matchingAnswer(questionId: string): Record<string, string> {
    const value = answers[questionId];
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
    const result: Record<string, string> = {};
    for (const [key, entry] of Object.entries(value)) if (typeof entry === 'string') result[key] = entry;
    return result;
  }

  function setMultipleChoice(questionId: string, optionId: string, checked: boolean) {
    const selected = selectedAnswers(questionId).filter((id) => id !== optionId);
    setAnswer(questionId, checked ? [...selected, optionId] : selected);
  }

  function setMatching(questionId: string, leftId: string, rightId: string) {
    setAnswer(questionId, { ...matchingAnswer(questionId), [leftId]: rightId });
  }

  const enhanceQuiz: SubmitFunction = () => {
    submitting = true;
    actionError = '';
    return async ({ result, update }) => {
      submitting = false;
      if (result.type === 'success' && isRecord(result.data) && isQuizResult(result.data.quizResult)) {
        quizResult = result.data.quizResult;
      } else if (result.type === 'failure') {
        const data: unknown = result.data;
        actionError = isRecord(data) && data.error === 'quiz.error.attemptsExhausted'
          ? $t('quiz.error.attemptsExhausted')
          : $t('quiz.error.invalidAnswers');
      }
      await update();
    };
  };

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  function isQuizResult(value: unknown): value is QuizResult {
    if (!isRecord(value)) return false;
    return typeof value.scorePercent === 'number' && typeof value.passed === 'boolean' &&
      typeof value.attemptsUsed === 'number' && Array.isArray(value.review);
  }

  function retry() {
    quizResult = null;
    answers = {};
    actionError = '';
  }
</script>

<div class="space-y-6">
  <Card>
    <div class="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
      <Badge variant="outline">{$t('quiz.player.attempts', { used: detail.attemptsUsed })}</Badge>
      {#if detail.settings.maxAttempts !== null}
        <Badge variant="outline">{$t('quiz.player.attemptLimit', { limit: detail.settings.maxAttempts })}</Badge>
      {/if}
      {#if detail.bestScorePercent !== null}
        <Badge variant="outline">{$t('quiz.player.bestScore', { score: detail.bestScorePercent })}</Badge>
      {/if}
      <Badge variant="outline">{$t('quiz.player.passThreshold', { score: detail.settings.passPercent })}</Badge>
    </div>
  </Card>

  {#if quizResult}
    <QuizResultView
      result={quizResult}
      questions={detail.questions}
      canTryAgain={quizResult.maxAttempts === null || quizResult.attemptsUsed < quizResult.maxAttempts}
      onTryAgain={retry}
    />
  {:else}
    <form method="POST" action="?/submit" use:enhance={enhanceQuiz} class="space-y-5">
      <input type="hidden" name="answers" value={answersJson} />
      {#each detail.questions as question, index (question.id)}
        <Card>
          <div class="mb-4 flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <p class="mono-label mb-2 text-xs text-ink-muted">{index + 1} · {question.points}</p>
              <MarkdownContent source={question.promptMd} />
            </div>
            <span class="text-xs text-ink-muted">{$t('quiz.editor.points')}</span>
          </div>

          {#if question.kind === 'single_choice'}
            <RadioGroup
              value={stringAnswer(question.id)}
              items={question.config.options.map((option) => ({ value: option.id, label: option.text }))}
              onValueChange={(value) => setAnswer(question.id, value)}
            />
          {:else if question.kind === 'multiple_choice'}
            <fieldset class="space-y-3">
              <legend class="sr-only">{$t('quiz.editor.correctAnswers')}</legend>
              {#each question.config.options as option (option.id)}
                <Checkbox
                  checked={selectedAnswers(question.id).includes(option.id)}
                  label={option.text}
                  onCheckedChange={(checked) => setMultipleChoice(question.id, option.id, checked)}
                />
              {/each}
            </fieldset>
          {:else if question.kind === 'true_false'}
            <RadioGroup
              value={typeof answers[question.id] === 'boolean' ? (answers[question.id] ? 'true' : 'false') : ''}
              items={[
                { value: 'true', label: $t('quiz.result.true') },
                { value: 'false', label: $t('quiz.result.false') }
              ]}
              onValueChange={(value) => setAnswer(question.id, value === 'true')}
            />
          {:else if question.kind === 'short_answer'}
            <InputField
              label={$t('quiz.player.answer')}
              maxlength="2000"
              value={stringAnswer(question.id)}
              oninput={(event: Event) => setAnswer(question.id, eventValue(event))}
            />
          {:else if question.kind === 'numeric'}
            <div class="flex flex-wrap items-end gap-3">
              <div class="w-full max-w-sm">
                <InputField
                  label={$t('quiz.player.answer')}
                  type="text"
                  inputmode="decimal"
                  maxlength="200"
                  value={stringAnswer(question.id)}
                  oninput={(event: Event) => setAnswer(question.id, eventValue(event))}
                />
              </div>
              {#if question.config.unit}<span class="pb-3 text-sm text-ink-muted">{question.config.unit}</span>{/if}
            </div>
          {:else}
            <div class="space-y-3">
              {#each question.config.left as item (item.id)}
                <Select
                  label={item.text}
                  items={question.config.right.map((option) => ({ value: option.id, label: option.text }))}
                  value={matchingAnswer(question.id)[item.id] ?? ''}
                  placeholder={$t('quiz.player.selectOption')}
                  onValueChange={(value) => setMatching(question.id, item.id, value)}
                />
              {/each}
            </div>
          {/if}
        </Card>
      {/each}
      {#if actionError}
        <FormMessage variant="error">{actionError}</FormMessage>
      {/if}
      <Button type="submit" disabled={submitting || attemptsExhausted}>
        {submitting ? $t('common.loading') : $t('quiz.player.submit')}
      </Button>
      {#if attemptsExhausted}
        <p role="status" class="text-sm text-ink-muted">{$t('quiz.error.attemptsExhausted')}</p>
      {/if}
    </form>
  {/if}
</div>
