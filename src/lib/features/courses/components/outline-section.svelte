<script lang="ts">
  import { Button, ConfirmDialog, InputField, Select, type SelectOption } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import ItemRow from './item-row.svelte';
  import type { OutlineSection } from '../server/outline-service';

  let { section, courseId }: { section: OutlineSection; courseId: string } = $props();
  let itemType = $state('lesson');
  let confirmOpen = $state(false);
  let deleteForm = $state<HTMLFormElement | null>(null);
  const itemTypes = $derived<SelectOption[]>([
    { value: 'lesson', label: $t('manage.itemType.lesson') },
    { value: 'quiz', label: $t('manage.itemType.quiz') },
    { value: 'exercise', label: $t('manage.itemType.exercise') }
  ]);
</script>

<section class="space-y-4 rounded-sm border border-border bg-surface-muted/20 p-4">
  <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
    <form method="POST" action="?/renameSection" class="flex items-end gap-2">
      <input type="hidden" name="sectionId" value={section.id} />
      <InputField label={$t('manage.sectionTitle')} name="title" value={section.title} required maxlength="120" />
      <Button type="submit" variant="secondary">{$t('common.rename')}</Button>
    </form>
    <div class="flex items-center gap-2">
      <form method="POST" action="?/moveSection">
        <input type="hidden" name="sectionId" value={section.id} />
        <input type="hidden" name="direction" value="up" />
        <Button type="submit" variant="secondary" class="btn-icon-sq" aria-label={$t('common.moveUp')}>
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 14 6-6 6 6" /></svg>
        </Button>
      </form>
      <form method="POST" action="?/moveSection">
        <input type="hidden" name="sectionId" value={section.id} />
        <input type="hidden" name="direction" value="down" />
        <Button type="submit" variant="secondary" class="btn-icon-sq" aria-label={$t('common.moveDown')}>
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 10 6 6 6-6" /></svg>
        </Button>
      </form>
      <form bind:this={deleteForm} method="POST" action="?/deleteSection"><input type="hidden" name="sectionId" value={section.id} /></form>
      <Button type="button" variant="danger" onclick={() => (confirmOpen = true)}>{$t('common.delete')}</Button>
    </div>
  </div>
  <div class="space-y-3">
    {#each section.items as item (item.id)}
      <ItemRow {item} {courseId} />
    {:else}
      <p class="text-sm text-ink-muted">{$t('manage.emptyItems')}</p>
    {/each}
  </div>
  <form method="POST" action="?/addItem" class="grid gap-3 border-t border-border pt-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end">
    <input type="hidden" name="sectionId" value={section.id} />
    <InputField label={$t('manage.itemTitle')} name="title" required maxlength="120" />
    <Select label={$t('manage.itemTypeLabel')} items={itemTypes} bind:value={itemType} name="type" />
    <Button type="submit">{$t('manage.addItem')}</Button>
  </form>
</section>

<ConfirmDialog
  bind:open={confirmOpen}
  title={$t('manage.confirmDeleteSectionTitle')}
  description={$t('manage.confirmDeleteSection')}
  confirmText={$t('common.delete')}
  cancelText={$t('common.cancel')}
  onConfirm={() => deleteForm?.requestSubmit()}
/>
