<script lang="ts">
  import { Button, Card, InputField } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import OutlineSection from './outline-section.svelte';
  import type { OutlineSection as OutlineSectionData } from '../server/outline-service';

  let { sections, courseId }: { sections: OutlineSectionData[]; courseId: string } = $props();
</script>

<Card class="space-y-5">
  <div>
    <h2 class="text-lg font-semibold text-ink">{$t('manage.outlineTitle')}</h2>
    <p class="mt-1 text-sm text-ink-muted">{$t('manage.outlineDescription')}</p>
  </div>
  <form method="POST" action="?/addSection" class="flex flex-wrap items-end gap-3">
    <InputField label={$t('manage.sectionTitle')} name="title" required maxlength="120" />
    <Button type="submit">{$t('manage.addSection')}</Button>
  </form>
  {#if sections.length === 0}
    <p class="text-sm text-ink-muted">{$t('manage.emptySections')}</p>
  {:else}
    <div class="space-y-4">
      {#each sections as section (section.id)}
        <OutlineSection {section} {courseId} />
      {/each}
    </div>
  {/if}
</Card>
