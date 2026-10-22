<script lang="ts">
  import { resolve } from '$app/paths';
  import { Badge, Button, Card, PageHeader } from 'cset-ui';
  import ProgressBar from '$lib/core/shell/progress-bar.svelte';
  import { t } from '$lib/core/i18n';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const itemCount = $derived(data.outline.reduce((count, section) => count + section.items.length, 0));
  const canOpenItems = $derived(data.enrolled || data.canManage);
</script>

<div class="space-y-7">
  <PageHeader eyebrow={$t('courses.courseEyebrow')} title={data.course.title}>
    {$t('courses.courseDescription')}
  </PageHeader>
  <div class="flex flex-wrap items-center gap-3">
    {#if data.course.status === 'draft'}
      <Badge variant="soft" color="amber">{$t('courses.draftPreview')}</Badge>
    {/if}
    {#if data.enrolled}
      <Badge variant="soft" color="emerald">{$t('courses.enrolled')}</Badge>
    {/if}
  </div>
  <Card class="space-y-4">
    <p class="whitespace-pre-wrap text-sm text-ink-muted">{data.course.summary}</p>
    {#if data.enrolled}
      <div class="space-y-2">
        <div class="flex justify-between text-xs text-ink-muted">
          <span>{$t('courses.progress')}</span>
          <span>{data.completedItemIds.length}/{itemCount}</span>
        </div>
        <ProgressBar
          value={data.completedItemIds.length}
          max={itemCount}
          label={$t('courses.progressLabel', { completed: data.completedItemIds.length, total: itemCount })}
        />
      </div>
    {/if}
    {#if data.enrolled && data.continueItemId}
      <Button href={resolve('/(app)/courses/[slug]/learn/[itemId]', { slug: data.course.slug, itemId: data.continueItemId })}>
        {$t('courses.continue')}
      </Button>
    {:else if !data.enrolled && data.course.status === 'published'}
      <form method="POST" action="?/enroll">
        <Button type="submit">{$t('courses.enroll')}</Button>
      </form>
    {/if}
  </Card>

  <section class="space-y-4">
    <h2 class="text-xl font-semibold text-ink">{$t('courses.syllabus')}</h2>
    {#each data.outline as section (section.id)}
      <Card class="space-y-4">
        <h3 class="text-lg font-semibold text-ink">{section.title}</h3>
        {#if section.items.length === 0}
          <p class="text-sm text-ink-muted">{$t('courses.emptySection')}</p>
        {:else}
          <ol class="space-y-2">
            {#each section.items as item (item.id)}
              <li class="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                <span class="flex items-center gap-2 text-sm text-ink">
                  {#if data.completedItemIds.includes(item.id)}
                    <svg class="h-4 w-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-label={$t('courses.completed')}><path d="m5 12 4 4L19 6" /></svg>
                  {/if}
                  {item.title}
                </span>
                <span class="text-xs text-ink-muted">{$t(item.type === 'lesson' ? 'courses.itemType.lesson' : item.type === 'quiz' ? 'courses.itemType.quiz' : 'courses.itemType.exercise')}</span>
                {#if canOpenItems}
                  <a class="text-sm text-accent underline" href={resolve('/(app)/courses/[slug]/learn/[itemId]', { slug: data.course.slug, itemId: item.id })}>
                    {$t('courses.openItem')}
                  </a>
                {/if}
              </li>
            {/each}
          </ol>
        {/if}
      </Card>
    {/each}
  </section>
</div>
