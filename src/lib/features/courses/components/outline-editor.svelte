<script lang="ts">
  import { Button, Card, Dialog, InputField } from 'cset-ui';
  import { eventValue } from '$lib/core/forms/event-value';
  import { t } from '$lib/core/i18n';
  import OutlineSection from './outline-section.svelte';
  import type { OutlineSection as OutlineSectionData } from '../server/outline-service';

  let { sections, courseId }: { sections: OutlineSectionData[]; courseId: string } = $props();

  let addSectionOpen = $state(false);
  let newSectionTitle = $state('');

  function handleOpenDialog() {
    newSectionTitle = '';
    addSectionOpen = true;
  }
</script>

<Card class="space-y-5 p-6">
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
    <div>
      <h2 class="text-base font-bold text-ink">{$t('manage.outlineTitle')}</h2>
      <p class="mt-0.5 text-xs text-ink-muted">{$t('manage.outlineDescription')}</p>
    </div>

    <Button
      type="button"
      variant="secondary"
      class="h-8 px-3 text-xs shrink-0"
      onclick={handleOpenDialog}
    >
      <svg class="mr-1.5 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M5 12h14m-7-7v14" />
      </svg>
      {$t('manage.addSection')}
    </Button>
  </div>

  {#if sections.length === 0}
    <div class="rounded-md border border-dashed border-border p-8 text-center">
      <p class="text-xs text-ink-muted">{$t('manage.emptySections')}</p>
      <div class="mt-3">
        <Button type="button" variant="secondary" size="sm" onclick={handleOpenDialog}>
          {$t('manage.addSection')}
        </Button>
      </div>
    </div>
  {:else}
    <div class="space-y-4">
      {#each sections as section (section.id)}
        <OutlineSection {section} {courseId} />
      {/each}
    </div>
  {/if}
</Card>

<!-- Add Section Dialog -->
<Dialog bind:open={addSectionOpen} title={$t('manage.section.addDialogTitle')} size="sm">
  <form
    method="POST"
    action="?/addSection"
    class="space-y-4"
    onsubmit={() => (addSectionOpen = false)}
  >
    <InputField
      label={$t('manage.sectionTitle')}
      name="title"
      required
      maxlength={120}
      value={newSectionTitle}
      oninput={(e: Event) => (newSectionTitle = eventValue(e))}
      placeholder="Ví dụ: Phần 1: Giới thiệu căn bản..."
    />
    <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
      <Button type="button" variant="secondary" onclick={() => (addSectionOpen = false)}>
        {$t('common.cancel')}
      </Button>
      <Button type="submit" disabled={!newSectionTitle.trim()}>
        {$t('manage.addSection')}
      </Button>
    </div>
  </form>
</Dialog>
