<script lang="ts">
  import { resolve } from '$app/paths';
  import { Button, ConfirmDialog, toast } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import type { LessonAttachment } from '../server/lesson-service';

  let { attachment }: { attachment: LessonAttachment } = $props();
  let confirmOpen = $state(false);
  let deleteForm = $state<HTMLFormElement | null>(null);

  async function copyMarkdown() {
    const url = resolve('/(app)/files/[attachmentId]', { attachmentId: attachment.id });
    const label = attachment.fileName.replace(/[\\[\]]/g, '\\$&');
    const image = attachment.contentType.startsWith('image/');
    const markdown = image ? `![${label}](${url})` : `[${label}](${url})`;
    try {
      await navigator.clipboard.writeText(markdown);
      toast.success($t('lesson.attachmentCopied'));
    } catch {
      toast.error($t('lesson.error.copyFailed'));
    }
  }
</script>

<li class="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3 last:border-0">
  <div class="min-w-0">
    <a class="break-all text-sm text-accent underline" href={resolve('/(app)/files/[attachmentId]', { attachmentId: attachment.id })}>
      {attachment.fileName}
    </a>
    <p class="text-xs text-ink-muted">{Math.ceil(attachment.sizeBytes / 1024)} {$t('lesson.kilobytes')}</p>
  </div>
  <div class="flex gap-2">
    <Button type="button" variant="secondary" onclick={copyMarkdown}>{$t('lesson.copyMarkdown')}</Button>
    <form bind:this={deleteForm} method="POST" action="?/deleteAttachment">
      <input type="hidden" name="attachmentId" value={attachment.id} />
    </form>
    <Button type="button" variant="danger" onclick={() => (confirmOpen = true)}>{$t('common.delete')}</Button>
  </div>
</li>

<ConfirmDialog
  bind:open={confirmOpen}
  title={$t('lesson.confirmDeleteAttachmentTitle')}
  description={$t('lesson.confirmDeleteAttachment')}
  confirmText={$t('common.delete')}
  cancelText={$t('common.cancel')}
  onConfirm={() => deleteForm?.requestSubmit()}
/>
