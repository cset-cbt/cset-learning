<script lang="ts">
  import { resolve } from '$app/paths';
  import { Button, ConfirmDialog, InputField } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import type { OutlineItem } from '../server/outline-service';

  let { item, courseId }: { item: OutlineItem; courseId: string } = $props();
  let confirmOpen = $state(false);
  let deleteForm = $state<HTMLFormElement | null>(null);
</script>

<div class="grid gap-3 rounded-sm border border-border p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
  <div class="flex min-w-0 items-center gap-3">
    <span class="text-xs uppercase tracking-wide text-ink-muted">
      {$t(item.type === 'lesson' ? 'manage.itemType.lesson' : item.type === 'quiz' ? 'manage.itemType.quiz' : 'manage.itemType.exercise')}
    </span>
    <form method="POST" action="?/renameItem" class="flex min-w-0 flex-1 items-end gap-2">
      <input type="hidden" name="itemId" value={item.id} />
      <InputField label={$t('manage.itemTitle')} name="title" value={item.title} required maxlength="120" />
      <Button type="submit" variant="secondary">{$t('common.rename')}</Button>
    </form>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <Button
      type="submit"
      variant="secondary"
      form="move-up-{item.id}"
      class="btn-icon-sq"
      aria-label={$t('common.moveUp')}
    >
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 14 6-6 6 6" /></svg>
    </Button>
    <form id="move-up-{item.id}" method="POST" action="?/moveItem" class="hidden">
      <input type="hidden" name="itemId" value={item.id} /><input type="hidden" name="direction" value="up" />
    </form>
    <Button type="submit" variant="secondary" form="move-down-{item.id}" class="btn-icon-sq" aria-label={$t('common.moveDown')}>
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 10 6 6 6-6" /></svg>
    </Button>
    <form id="move-down-{item.id}" method="POST" action="?/moveItem" class="hidden">
      <input type="hidden" name="itemId" value={item.id} /><input type="hidden" name="direction" value="down" />
    </form>
    <Button variant="secondary" href={resolve('/(app)/manage/[courseId]/items/[itemId]', { courseId, itemId: item.id })}>
      {$t('manage.openItem')}
    </Button>
    <form bind:this={deleteForm} method="POST" action="?/deleteItem">
      <input type="hidden" name="itemId" value={item.id} />
    </form>
    <Button type="button" variant="danger" onclick={() => (confirmOpen = true)}>{$t('common.delete')}</Button>
  </div>
</div>

<ConfirmDialog
  bind:open={confirmOpen}
  title={$t('manage.confirmDeleteItemTitle')}
  description={$t('manage.confirmDeleteItem')}
  confirmText={$t('common.delete')}
  cancelText={$t('common.cancel')}
  onConfirm={() => deleteForm?.requestSubmit()}
/>
