<script lang="ts">
  import { resolve } from '$app/paths';
  import { Button, Card, FormMessage, InputField, PageHeader } from 'cset-ui';
  import { isMessageKey, t } from '$lib/core/i18n';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="space-y-8">
  <PageHeader eyebrow="CSET LEARNING" title={$t('manage.title')}>
    {$t('manage.description')}
  </PageHeader>

  <Card>
    <h2 class="mb-4 text-lg font-semibold text-ink">{$t('manage.createCourse')}</h2>
    <form method="POST" action="?/create" class="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <InputField label={$t('manage.courseTitle')} name="title" required maxlength="120" />
      <InputField label={$t('manage.courseSummary')} name="summary" maxlength="280" />
      <Button type="submit">{$t('manage.create')}</Button>
    </form>
    {#if form?.error}
      <div class="mt-4"><FormMessage variant="error">{$t(isMessageKey(form.error) ? form.error : 'manage.error.generic')}</FormMessage></div>
    {/if}
  </Card>

  <section class="space-y-4">
    <h2 class="text-lg font-semibold text-ink">{$t('manage.yourCourses')}</h2>
    {#if data.courses.length === 0}
      <Card><p class="text-sm text-ink-muted">{$t('manage.empty')}</p></Card>
    {:else}
      <div class="grid gap-4 md:grid-cols-2">
        {#each data.courses as course (course.id)}
          <Card class="space-y-3">
            <h3 class="text-base font-semibold text-ink">
              <a class="hover:text-accent" href={resolve('/(app)/manage/[courseId]', { courseId: course.id })}>{course.title}</a>
            </h3>
            <p class="text-sm text-ink-muted">{course.summary}</p>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <span class="text-xs text-ink-muted">{course.ownerName}</span>
              <span class="text-xs uppercase tracking-wide text-ink-muted">
                {$t(course.status === 'published' ? 'manage.status.published' : 'manage.status.draft')}
              </span>
            </div>
            <Button variant="secondary" href={resolve('/(app)/manage/[courseId]', { courseId: course.id })}>
              {$t('manage.editCourse')}
            </Button>
          </Card>
        {/each}
      </div>
    {/if}
  </section>
</div>
