<script lang="ts">
  import { Card, PageHeader, Tabs, type TabItem } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import CourseCard from '$lib/features/courses/components/course-card.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let filter = $state('all');
  const tabs = $derived<TabItem[]>([
    { value: 'all', label: $t('courses.allCourses') },
    { value: 'mine', label: $t('courses.myCourses') }
  ]);
  const visibleCourses = $derived(
    filter === 'mine' ? data.courses.filter((course) => course.enrolled) : data.courses
  );
</script>

<div class="space-y-8">
  <PageHeader eyebrow="CSET LEARNING" title={$t('courses.catalogTitle')}>
    {$t('courses.catalogDescription')}
  </PageHeader>
  <Tabs bind:value={filter} items={tabs} />
  {#if visibleCourses.length === 0}
    <Card class="text-sm text-ink-muted">
      {$t(filter === 'mine' ? 'courses.emptyMine' : 'courses.emptyCatalog')}
    </Card>
  {:else}
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each visibleCourses as course (course.id)}
        <CourseCard {course} />
      {/each}
    </div>
  {/if}
</div>
