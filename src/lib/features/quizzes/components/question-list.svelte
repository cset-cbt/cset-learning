<script lang="ts">
  import { enhance } from '$app/forms';
  import { Button, Card } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import type { EditorQuestion } from '../shared/contract';
  import MarkdownContent from '$lib/features/lessons/components/markdown-content.svelte';

  interface Props {
    questions: EditorQuestion[];
    onEdit: (question: EditorQuestion) => void;
  }

  let { questions, onEdit }: Props = $props();
</script>

<div class="space-y-4">
  {#if questions.length === 0}
    <Card><p class="text-sm text-ink-muted">{$t('quiz.editor.empty')}</p></Card>
  {:else}
    <ol class="space-y-3">
      {#each questions as question, index (question.id)}
        <li>
          <Card>
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="min-w-0 flex-1 space-y-1">
                <p class="mono-label text-xs text-ink-muted">
                  {index + 1}. {$t(`quiz.kind.${question.kind}`)} · {question.points} {$t('quiz.editor.points')}
                </p>
                <MarkdownContent source={question.promptMd} />
              </div>
              <div class="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onclick={() => onEdit(question)}>
                  {$t('common.edit')}
                </Button>
                <form method="POST" action="?/moveQuestion" use:enhance>
                  <input type="hidden" name="questionId" value={question.id} />
                  <input type="hidden" name="direction" value="up" />
                  <Button
                    type="submit"
                    variant="secondary"
                    class="btn-icon-sq"
                    disabled={index === 0}
                    aria-label={$t('common.moveUp')}
                  >
                    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="m6 14 6-6 6 6" />
                    </svg>
                  </Button>
                </form>
                <form method="POST" action="?/moveQuestion" use:enhance>
                  <input type="hidden" name="questionId" value={question.id} />
                  <input type="hidden" name="direction" value="down" />
                  <Button
                    type="submit"
                    variant="secondary"
                    class="btn-icon-sq"
                    disabled={index === questions.length - 1}
                    aria-label={$t('common.moveDown')}
                  >
                    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="m6 10 6 6 6-6" />
                    </svg>
                  </Button>
                </form>
                <form method="POST" action="?/deleteQuestion" use:enhance>
                  <input type="hidden" name="questionId" value={question.id} />
                  <Button type="submit" variant="danger">{$t('common.delete')}</Button>
                </form>
              </div>
            </div>
          </Card>
        </li>
      {/each}
    </ol>
  {/if}
</div>
