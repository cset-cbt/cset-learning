<script lang="ts">
  import { resolve } from '$app/paths';
  import { Badge, Button, Card, FormMessage, PageHeader } from 'cset-ui';
  import CreateCourseDialog from '$lib/features/courses/components/create-course-dialog.svelte';
  import { isMessageKey, t } from '$lib/core/i18n';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let createOpen = $state(false);
</script>

<div class="space-y-8">
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <PageHeader eyebrow="CSET LEARNING" title={$t('manage.title')}>
      {$t('manage.description')}
    </PageHeader>

    <Button type="button" class="shrink-0" onclick={() => (createOpen = true)}>
      <svg class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <path d="M5 12h14m-7-7v14" />
      </svg>
      {$t('manage.createCourse')}
    </Button>
  </div>

  {#if form?.error}
    <FormMessage variant="error">
      {$t(isMessageKey(form.error) ? form.error : 'manage.error.generic')}
    </FormMessage>
  {/if}

  <section class="space-y-4">
    <div class="flex items-center justify-between border-b border-border pb-3">
      <h2 class="text-base font-bold text-ink">{$t('manage.yourCourses')}</h2>
      <span class="mono-label text-xs text-ink-muted">
        {data.courses.length} {data.courses.length === 1 ? 'course' : 'courses'}
      </span>
    </div>

    {#if data.courses.length === 0}
      <Card class="p-8 text-center">
        <p class="text-sm text-ink-muted">{$t('manage.empty')}</p>
        <div class="mt-4">
          <Button type="button" variant="secondary" onclick={() => (createOpen = true)}>
            {$t('manage.createCourse')}
          </Button>
        </div>
      </Card>
    {:else}
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each data.courses as item (item.id)}
          <Card class="flex flex-col overflow-hidden p-0 transition-all hover:border-accent/40">
            <!-- Cover image thumbnail or Blueprint pattern -->
            <div class="relative h-40 w-full overflow-hidden bg-surface-muted border-b border-border">
              {#if item.coverImageUrl}
                <img
                  src={item.coverImageUrl}
                  alt={item.title}
                  class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              {:else}
                <div class="flex h-full w-full items-center justify-center dot-grid-bg text-ink-muted">
                  <span class="mono-label text-xs">CSET BLUEPRINT</span>
                </div>
              {/if}

              <div class="absolute right-3 top-3">
                <Badge variant="soft" color={item.status === 'published' ? 'emerald' : 'neutral'} size="sm">
                  {$t(item.status === 'published' ? 'manage.status.published' : 'manage.status.draft')}
                </Badge>
              </div>
            </div>

            <!-- Content body -->
            <div class="flex flex-1 flex-col justify-between p-5 space-y-4">
              <div class="space-y-2">
                <h3 class="font-sans text-base font-bold text-ink line-clamp-1 hover:text-accent">
                  <a href={resolve('/(app)/manage/[courseId]', { courseId: item.id })}>
                    {item.title}
                  </a>
                </h3>
                <p class="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                  {item.summary || 'Chưa có mô tả ngắn cho khóa học này.'}
                </p>
              </div>

              <div class="space-y-3 pt-2 border-t border-border">
                <div class="flex items-center justify-between font-mono text-[0.72rem] text-ink-muted">
                  <span class="truncate max-w-[12rem]">{item.ownerName}</span>
                  <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                </div>

                <Button
                  variant="secondary"
                  class="w-full justify-center"
                  href={resolve('/(app)/manage/[courseId]', { courseId: item.id })}
                >
                  {$t('manage.editCourse')}
                </Button>
              </div>
            </div>
          </Card>
        {/each}
      </div>
    {/if}
  </section>
</div>

<CreateCourseDialog bind:open={createOpen} />
