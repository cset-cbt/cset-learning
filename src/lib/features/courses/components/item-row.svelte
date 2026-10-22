<script lang="ts">
  import { resolve } from '$app/paths';
  import { Badge, Button, ConfirmDialog } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import type { OutlineItem } from '../server/outline-service';

  let { item, courseId }: { item: OutlineItem; courseId: string } = $props();
  let confirmOpen = $state(false);
  let deleteForm = $state<HTMLFormElement | null>(null);

  const badgeColor = $derived<'accent' | 'purple' | 'emerald'>(
    item.type === 'lesson' ? 'accent' : item.type === 'quiz' ? 'purple' : 'emerald'
  );
</script>

<div
  class="flex flex-col gap-3 rounded-md border border-border bg-surface p-3.5 transition-colors hover:border-accent/40 sm:flex-row sm:items-center sm:justify-between"
>
  <!-- Left: Type Badge & Title -->
  <div class="flex min-w-0 items-center gap-3">
    <Badge variant="soft" color={badgeColor} size="sm" class="shrink-0">
      {$t(item.type === 'lesson' ? 'manage.itemType.lesson' : item.type === 'quiz' ? 'manage.itemType.quiz' : 'manage.itemType.exercise')}
    </Badge>

    <a
      href={resolve('/(app)/manage/[courseId]/items/[itemId]', { courseId, itemId: item.id })}
      class="truncate font-sans text-sm font-semibold text-ink hover:text-accent hover:underline"
      title={item.title}
    >
      {item.title}
    </a>
  </div>

  <!-- Right: Actions -->
  <div class="flex flex-wrap items-center gap-2 self-end sm:self-auto">
    <Button
      type="submit"
      variant="secondary"
      form="move-up-{item.id}"
      class="btn-icon-sq"
      aria-label={$t('common.moveUp')}
    >
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="m6 14 6-6 6 6" />
      </svg>
    </Button>
    <form id="move-up-{item.id}" method="POST" action="?/moveItem" class="hidden">
      <input type="hidden" name="itemId" value={item.id} />
      <input type="hidden" name="direction" value="up" />
    </form>

    <Button
      type="submit"
      variant="secondary"
      form="move-down-{item.id}"
      class="btn-icon-sq"
      aria-label={$t('common.moveDown')}
    >
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="m6 10 6 6 6-6" />
      </svg>
    </Button>
    <form id="move-down-{item.id}" method="POST" action="?/moveItem" class="hidden">
      <input type="hidden" name="itemId" value={item.id} />
      <input type="hidden" name="direction" value="down" />
    </form>

    <Button
      variant="secondary"
      href={resolve('/(app)/manage/[courseId]/items/[itemId]', { courseId, itemId: item.id })}
    >
      {$t('manage.openItem')}
    </Button>

    <form bind:this={deleteForm} method="POST" action="?/deleteItem" class="hidden">
      <input type="hidden" name="itemId" value={item.id} />
    </form>
    <Button type="button" variant="danger" onclick={() => (confirmOpen = true)}>
      {$t('common.delete')}
    </Button>
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
