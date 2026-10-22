<script lang="ts">
  import { resolve } from '$app/paths';
  import { Breadcrumb, Button, Card, ConfirmDialog, FormMessage, PageHeader } from 'cset-ui';
  import { isMessageKey, t } from '$lib/core/i18n';
  import CourseSettingsForm from '$lib/features/courses/components/course-settings-form.svelte';
  import OutlineEditor from '$lib/features/courses/components/outline-editor.svelte';
  import PublishToggle from '$lib/features/courses/components/publish-toggle.svelte';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let deleteOpen = $state(false);
  let deleteForm = $state<HTMLFormElement | null>(null);
</script>

<div class="space-y-7">
  <Breadcrumb
    items={[
      { label: $t('nav.manage'), href: resolve('/manage') },
      { label: data.course.title }
    ]}
  />
  <PageHeader eyebrow={$t('manage.courseEyebrow')} title={data.course.title}>
    {$t('manage.courseDescription')}
  </PageHeader>
  {#if form?.error}
    <div class="space-y-2">
      <FormMessage variant="error">{$t(isMessageKey(form.error) ? form.error : 'manage.error.generic')}</FormMessage>
      {#if form.details?.length}
        <ul class="list-disc space-y-1 pl-5 text-sm text-danger">
          {#each form.details as detail, index (`${index}-${detail}`)}
            <li>{$t(isMessageKey(detail) ? detail : 'manage.error.generic')}</li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
  <Card class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h2 class="text-lg font-semibold text-ink">{$t('manage.settingsTitle')}</h2>
      <PublishToggle status={data.course.status} />
    </div>
    <CourseSettingsForm course={data.course} />
  </Card>
  <OutlineEditor sections={data.sections} courseId={data.course.id} />
  <Card class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h2 class="font-semibold text-ink">{$t('manage.deleteCourseTitle')}</h2>
      <p class="mt-1 text-sm text-ink-muted">{$t('manage.deleteCourseDescription')}</p>
    </div>
    <form bind:this={deleteForm} method="POST" action="?/deleteCourse"></form>
    <Button type="button" variant="danger" onclick={() => (deleteOpen = true)}>{$t('common.delete')}</Button>
  </Card>
</div>

<ConfirmDialog
  bind:open={deleteOpen}
  title={$t('manage.confirmDeleteCourseTitle')}
  description={$t('manage.confirmDeleteCourse')}
  confirmText={$t('common.delete')}
  cancelText={$t('common.cancel')}
  onConfirm={() => deleteForm?.requestSubmit()}
/>
