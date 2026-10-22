<script lang="ts">
  import { Button, ConfirmDialog, Dialog, InputField, Select, type SelectOption } from 'cset-ui';
  import { eventValue } from '$lib/core/forms/event-value';
  import { t } from '$lib/core/i18n';
  import ItemRow from './item-row.svelte';
  import type { OutlineSection } from '../server/outline-service';

  let { section, courseId }: { section: OutlineSection; courseId: string } = $props();

  let itemType = $state('lesson');
  let renameOpen = $state(false);
  let renameTitle = $state('');
  let confirmOpen = $state(false);
  let deleteForm = $state<HTMLFormElement | null>(null);

  const itemTypes = $derived<SelectOption[]>([
    { value: 'lesson', label: $t('manage.itemType.lesson') },
    { value: 'quiz', label: $t('manage.itemType.quiz') },
    { value: 'exercise', label: $t('manage.itemType.exercise') }
  ]);
</script>

<section class="space-y-4 rounded-lg border border-border bg-surface-muted/20 p-4 sm:p-5">
  <!-- Section Header -->
  <div class="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
    <div class="flex items-center gap-3">
      <h3 class="font-sans text-sm font-bold text-ink">
        {section.title}
      </h3>
      <Button
        type="button"
        variant="secondary"
        class="h-7 px-2.5 text-xs"
        onclick={() => {
          renameTitle = section.title;
          renameOpen = true;
        }}
      >
        {$t('manage.renameSection')}
      </Button>
    </div>

    <div class="flex items-center gap-2">
      <form method="POST" action="?/moveSection">
        <input type="hidden" name="sectionId" value={section.id} />
        <input type="hidden" name="direction" value="up" />
        <Button type="submit" variant="secondary" class="btn-icon-sq" aria-label={$t('common.moveUp')}>
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="m6 14 6-6 6 6" />
          </svg>
        </Button>
      </form>

      <form method="POST" action="?/moveSection">
        <input type="hidden" name="sectionId" value={section.id} />
        <input type="hidden" name="direction" value="down" />
        <Button type="submit" variant="secondary" class="btn-icon-sq" aria-label={$t('common.moveDown')}>
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="m6 10 6 6 6-6" />
          </svg>
        </Button>
      </form>

      <form bind:this={deleteForm} method="POST" action="?/deleteSection">
        <input type="hidden" name="sectionId" value={section.id} />
      </form>
      <Button type="button" variant="danger" onclick={() => (confirmOpen = true)}>
        {$t('common.delete')}
      </Button>
    </div>
  </div>

  <!-- Items list -->
  <div class="space-y-2.5">
    {#each section.items as item (item.id)}
      <ItemRow {item} {courseId} />
    {:else}
      <div class="rounded-md border border-dashed border-border p-4 text-center">
        <p class="text-xs text-ink-muted">{$t('manage.emptyItems')}</p>
      </div>
    {/each}
  </div>

  <!-- Add Item Form -->
  <form
    method="POST"
    action="?/addItem"
    class="grid gap-3 border-t border-border pt-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end"
  >
    <input type="hidden" name="sectionId" value={section.id} />
    <InputField label={$t('manage.itemTitle')} name="title" required maxlength={120} placeholder="Nhập tên bài học..." />
    <Select label={$t('manage.itemTypeLabel')} items={itemTypes} bind:value={itemType} name="type" />
    <Button type="submit">{$t('manage.addItem')}</Button>
  </form>
</section>

<!-- Rename Section Dialog -->
<Dialog bind:open={renameOpen} title={$t('manage.section.renameDialogTitle')} size="sm">
  <form method="POST" action="?/renameSection" class="space-y-4" onsubmit={() => (renameOpen = false)}>
    <input type="hidden" name="sectionId" value={section.id} />
    <InputField
      label={$t('manage.sectionTitle')}
      name="title"
      value={renameTitle}
      oninput={(e: Event) => (renameTitle = eventValue(e))}
      required
      maxlength={120}
    />
    <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
      <Button type="button" variant="secondary" onclick={() => (renameOpen = false)}>
        {$t('common.cancel')}
      </Button>
      <Button type="submit">
        {$t('common.rename')}
      </Button>
    </div>
  </form>
</Dialog>

<!-- Delete Section Dialog -->
<ConfirmDialog
  bind:open={confirmOpen}
  title={$t('manage.confirmDeleteSectionTitle')}
  description={$t('manage.confirmDeleteSection')}
  confirmText={$t('common.delete')}
  cancelText={$t('common.cancel')}
  onConfirm={() => deleteForm?.requestSubmit()}
/>
