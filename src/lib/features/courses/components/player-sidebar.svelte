<script lang="ts">
  import { resolve } from '$app/paths';
  import { Card } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import type { OutlineSection } from '../server/outline-service';

  let {
    sections,
    slug,
    currentItemId,
    completedItemIds
  }: { sections: OutlineSection[]; slug: string; currentItemId: string; completedItemIds: string[] } = $props();
</script>

<Card class="space-y-4">
  <h2 class="text-sm font-semibold text-ink">{$t('courses.outline')}</h2>
  {#each sections as section (section.id)}
    <section class="space-y-2">
      <h3 class="text-xs font-semibold text-ink-muted">{section.title}</h3>
      <ol class="space-y-1">
        {#each section.items as item (item.id)}
          <li>
            <a
              class="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm {item.id === currentItemId ? 'bg-surface-muted text-accent' : 'text-ink-muted hover:text-ink'}"
              href={resolve('/(app)/courses/[slug]/learn/[itemId]', { slug, itemId: item.id })}
              aria-current={item.id === currentItemId ? 'page' : undefined}
            >
              {#if completedItemIds.includes(item.id)}
                <svg class="h-4 w-4 shrink-0 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-label={$t('courses.completed')}><path d="m5 12 4 4L19 6" /></svg>
              {/if}
              <span class="min-w-0 truncate">{item.title}</span>
            </a>
          </li>
        {/each}
      </ol>
    </section>
  {/each}
</Card>
