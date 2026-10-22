<script lang="ts">
  import { Badge, Button, Card } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import type { PublicQuestion, QuizResult, QuizReviewAnswer } from '../shared/contract';
  import MarkdownContent from '$lib/features/lessons/components/markdown-content.svelte';

  interface Props {
    result: QuizResult;
    questions: PublicQuestion[];
    canTryAgain: boolean;
    onTryAgain: () => void;
  }

  let { result, questions, canTryAgain, onTryAgain }: Props = $props();

  function formatAnswer(answer: QuizReviewAnswer): string {
    if (typeof answer === 'string') return answer;
    if (typeof answer === 'boolean') return $t(answer ? 'quiz.result.true' : 'quiz.result.false');
    if (isStringArray(answer)) return answer.join(', ');
    if (isMatchingArray(answer)) return answer.map((pair) => `${pair.left} → ${pair.right}`).join('\n');
    if ('value' in answer && typeof answer.value === 'number' && typeof answer.tolerance === 'number') {
      const value = typeof answer.unit === 'string' ? `${answer.value} ${answer.unit}` : String(answer.value);
      return $t('quiz.result.numericAnswer', { value, tolerance: answer.tolerance });
    }
    return '';
  }

  function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
  }

  function isMatchingArray(value: unknown): value is { left: string; right: string }[] {
    return Array.isArray(value) && value.every((entry) =>
      typeof entry === 'object' && entry !== null && 'left' in entry && 'right' in entry &&
      typeof entry.left === 'string' && typeof entry.right === 'string'
    );
  }
</script>

<section class="space-y-5" aria-live="polite">
  <Card>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold text-ink">{$t('quiz.result.title')}</h2>
        <p class="mt-1 text-sm text-ink-muted">
          {$t('quiz.result.score', { earned: result.earnedPoints, total: result.totalPoints, percent: result.scorePercent })}
        </p>
      </div>
      <Badge color={result.passed ? 'emerald' : 'rose'} variant="soft">
        {$t(result.passed ? 'quiz.result.passed' : 'quiz.result.failed')}
      </Badge>
    </div>
    <div class="mt-3 space-y-1 text-xs text-ink-muted">
      <p>{$t('quiz.player.attempts', { used: result.attemptsUsed })}</p>
      <p>{$t('quiz.player.bestScore', { score: result.bestScorePercent })}</p>
    </div>
  </Card>

  {#each result.review as review, index (review.questionId)}
    {@const question = questions.find((item) => item.id === review.questionId)}
    <Card>
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <p class="mono-label mb-2 text-xs text-ink-muted">{index + 1}</p>
          {#if question}<MarkdownContent source={question.promptMd} />{/if}
        </div>
        <Badge color={review.correct ? 'emerald' : 'rose'} variant="soft">
          {$t(review.correct ? 'quiz.result.correct' : 'quiz.result.incorrect')}
        </Badge>
      </div>
      <div class="mt-4 space-y-3 border-t border-border pt-3">
        <div>
          <p class="mono-label text-xs text-ink-muted">{$t('quiz.result.correctAnswer')}</p>
          <p class="mt-1 whitespace-pre-wrap text-sm text-ink">{formatAnswer(review.correctAnswer)}</p>
        </div>
        {#if review.explanationMd}
          <div>
            <p class="mono-label mb-1 text-xs text-ink-muted">{$t('quiz.result.explanation')}</p>
            <MarkdownContent source={review.explanationMd} />
          </div>
        {/if}
      </div>
    </Card>
  {/each}

  {#if canTryAgain}
    <Button type="button" variant="secondary" onclick={onTryAgain}>{$t('quiz.result.tryAgain')}</Button>
  {/if}
</section>
