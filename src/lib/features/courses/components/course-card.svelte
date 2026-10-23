<script lang="ts">
  import { resolve } from '$app/paths';
  import { Badge, Card } from 'cset-ui';
  import ProgressBar from '$lib/core/shell/progress-bar.svelte';
  import { t } from '$lib/core/i18n';
  import type { CatalogCourse } from '../server/enrollment-service';

  let { course }: { course: CatalogCourse } = $props();
</script>

<Card class="group flex flex-col overflow-hidden p-0 transition-all duration-300 hover:border-accent hover:shadow-xl">
  <a
    href={resolve('/(app)/courses/[slug]', { slug: course.slug })}
    class="relative block aspect-video w-full overflow-hidden border-b border-border bg-surface-muted cursor-pointer"
  >
    {#if course.coverImageUrl}
      <img
        src={course.coverImageUrl}
        alt={course.title}
        class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        loading="lazy"
      />
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
    {:else}
      <div class="flex h-full w-full items-center justify-center dot-grid-bg">
        <div class="mono-label text-xs uppercase tracking-widest text-accent font-bold">
          CSET // COURSE
        </div>
      </div>
    {/if}

    {#if course.enrolled}
      <div class="absolute right-3 top-3">
        <Badge variant="solid" color="emerald">{$t('courses.enrolled')}</Badge>
      </div>
    {/if}
  </a>

  <div class="flex flex-1 flex-col justify-between space-y-4 p-5 sm:p-6">
    <div class="space-y-2">
      <h2 class="font-sans text-lg font-bold leading-snug text-ink">
        <a
          class="transition-colors hover:text-accent"
          href={resolve('/(app)/courses/[slug]', { slug: course.slug })}
        >
          {course.title}
        </a>
      </h2>
      <p class="line-clamp-2 text-sm text-ink-muted leading-relaxed">
        {course.summary}
      </p>
    </div>

    <div class="space-y-2 border-t border-border pt-4">
      <div class="flex justify-between font-mono text-xs text-ink-muted">
        <span>{$t('courses.progress')}</span>
        <span class="font-semibold text-ink">{course.completedCount}/{course.itemCount}</span>
      </div>
      <ProgressBar
        value={course.completedCount}
        max={course.itemCount}
        label={$t('courses.progressLabel', { completed: course.completedCount, total: course.itemCount })}
      />
    </div>
  </div>
</Card>
