<script lang="ts">
  import { Button, InputField } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import AttachmentRow from './attachment-row.svelte';
  import type { LessonAttachment } from '../server/lesson-service';

  let { attachments }: { attachments: LessonAttachment[] } = $props();
</script>

<section class="space-y-4 border-t border-border pt-5">
  <div>
    <h2 class="text-lg font-semibold text-ink">{$t('lesson.attachments')}</h2>
    <p class="mt-1 text-sm text-ink-muted">{$t('lesson.attachmentGuidance')}</p>
  </div>
  <form method="POST" action="?/uploadAttachment" enctype="multipart/form-data" class="flex flex-wrap items-end gap-3">
    <InputField
      label={$t('lesson.chooseFile')}
      name="file"
      type="file"
      accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.txt,.zip"
      required
    />
    <Button type="submit">{$t('lesson.upload')}</Button>
  </form>
  {#if attachments.length === 0}
    <p class="text-sm text-ink-muted">{$t('lesson.noAttachments')}</p>
  {:else}
    <ul>
      {#each attachments as attachment (attachment.id)}
        <AttachmentRow {attachment} />
      {/each}
    </ul>
  {/if}
</section>
