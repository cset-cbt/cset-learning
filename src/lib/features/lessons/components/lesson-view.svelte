<script lang="ts">
  import { resolve } from '$app/paths';
  import { Button, Card } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import MarkdownContent from './markdown-content.svelte';
  import type { LessonAttachment } from '../server/lesson-service';

  let {
    detail,
    completed
  }: { detail: { bodyMd: string; attachments: LessonAttachment[] }; completed: boolean } = $props();
</script>

<div class="space-y-6">
  <Card><MarkdownContent source={detail.bodyMd} /></Card>
  {#if detail.attachments.length > 0}
    <Card class="space-y-3">
      <h2 class="text-lg font-semibold text-ink">{$t('lesson.attachments')}</h2>
      <ul class="space-y-2">
        {#each detail.attachments as attachment (attachment.id)}
          <li>
            <a
              class="text-sm text-accent underline"
              href={resolve('/(app)/files/[attachmentId]', { attachmentId: attachment.id })}
            >
              {attachment.fileName}
            </a>
          </li>
        {/each}
      </ul>
    </Card>
  {/if}
  {#if completed}
    <p class="text-sm text-success">{$t('lesson.completed')}</p>
  {:else}
    <form method="POST" action="?/complete">
      <Button type="submit">{$t('lesson.markComplete')}</Button>
    </form>
  {/if}
</div>
