<script lang="ts">
  import { resolve } from '$app/paths';
  import { Badge, Card } from 'cset-ui';
  import ProgressBar from '$lib/core/shell/progress-bar.svelte';
  import { t } from '$lib/core/i18n';
  import type { CatalogCourse } from '../server/enrollment-service';

  let { course }: { course: CatalogCourse } = $props();
</script>

<Card class="space-y-4">
  <div class="flex items-start justify-between gap-4">
    <h2 class="text-lg font-semibold text-ink">
      <a class="hover:text-accent" href={resolve('/(app)/courses/[slug]', { slug: course.slug })}>{course.title}</a>
    </h2>
    {#if course.enrolled}<Badge variant="soft" color="emerald">{$t('courses.enrolled')}</Badge>{/if}
  </div>
  <p class="text-sm text-ink-muted">{course.summary}</p>
  <div class="space-y-2">
    <div class="flex justify-between text-xs text-ink-muted">
      <span>{$t('courses.progress')}</span>
      <span>{course.completedCount}/{course.itemCount}</span>
    </div>
    <ProgressBar
      value={course.completedCount}
      max={course.itemCount}
      label={$t('courses.progressLabel', { completed: course.completedCount, total: course.itemCount })}
    />
  </div>
</Card>
