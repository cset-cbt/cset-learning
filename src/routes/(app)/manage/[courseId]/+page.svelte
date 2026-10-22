<script lang="ts">
  import { resolve } from '$app/paths';
  import { Badge, Breadcrumb, Button, Card, ConfirmDialog, FormMessage, PageHeader } from 'cset-ui';
  import { isMessageKey, t } from '$lib/core/i18n';
  import CourseSettingsForm from '$lib/features/courses/components/course-settings-form.svelte';
  import OutlineEditor from '$lib/features/courses/components/outline-editor.svelte';
  import CourseMembersManager from '$lib/features/courses/components/course-members-manager.svelte';
  import PublishToggle from '$lib/features/courses/components/publish-toggle.svelte';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let activeTab = $state<'content' | 'members' | 'settings'>('content');
  let deleteOpen = $state(false);
  let deleteForm = $state<HTMLFormElement | null>(null);
</script>

<div class="space-y-7">
  <!-- Breadcrumbs -->
  <Breadcrumb
    items={[
      { label: $t('nav.manage'), href: resolve('/manage') },
      { label: data.course.title }
    ]}
  />

  <!-- Header with Publish Toggle -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div class="space-y-1">
      <div class="flex items-center gap-2.5">
        <span class="mono-label text-xs uppercase tracking-wider text-accent font-bold">
          {$t('manage.courseEyebrow')}
        </span>
        <Badge variant="soft" color={data.course.status === 'published' ? 'emerald' : 'neutral'} size="sm">
          {$t(data.course.status === 'published' ? 'manage.status.published' : 'manage.status.draft')}
        </Badge>
      </div>
      <h1 class="font-sans text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        {data.course.title}
      </h1>
      <p class="text-sm text-ink-muted">{$t('manage.courseDescription')}</p>
    </div>

    <div class="shrink-0">
      <PublishToggle status={data.course.status} />
    </div>
  </div>

  {#if form?.error}
    <div class="space-y-2">
      <FormMessage variant="error">
        {$t(isMessageKey(form.error) ? form.error : 'manage.error.generic')}
      </FormMessage>
      {#if form.details?.length}
        <ul class="list-disc space-y-1 pl-5 text-sm text-danger">
          {#each form.details as detail, index (`${index}-${detail}`)}
            <li>{$t(isMessageKey(detail) ? detail : 'manage.error.generic')}</li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}

  <!-- Tab Navigation -->
  <div class="flex items-center gap-1 border-b border-border">
    <button
      type="button"
      class="flex items-center gap-2 border-b-2 px-4 py-2.5 font-sans text-sm font-semibold transition-colors cursor-pointer {activeTab === 'content' ? 'border-accent text-accent' : 'border-transparent text-ink-muted hover:text-ink'}"
      onclick={() => (activeTab = 'content')}
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10" />
      </svg>
      {$t('manage.tab.content')}
    </button>

    <button
      type="button"
      class="flex items-center gap-2 border-b-2 px-4 py-2.5 font-sans text-sm font-semibold transition-colors cursor-pointer {activeTab === 'members' ? 'border-accent text-accent' : 'border-transparent text-ink-muted hover:text-ink'}"
      onclick={() => (activeTab = 'members')}
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      {$t('manage.tab.members')}
      <span class="rounded bg-surface-muted px-1.5 py-0.5 text-[0.65rem] font-mono text-ink-muted">
        {data.members.students.length}
      </span>
    </button>

    <button
      type="button"
      class="flex items-center gap-2 border-b-2 px-4 py-2.5 font-sans text-sm font-semibold transition-colors cursor-pointer {activeTab === 'settings' ? 'border-accent text-accent' : 'border-transparent text-ink-muted hover:text-ink'}"
      onclick={() => (activeTab = 'settings')}
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
      {$t('manage.tab.settings')}
    </button>
  </div>

  <!-- Tab Panes -->
  {#if activeTab === 'content'}
    <div class="space-y-6">
      <OutlineEditor sections={data.sections} courseId={data.course.id} />
    </div>
  {:else if activeTab === 'members'}
    <CourseMembersManager
      instructors={data.members.instructors}
      students={data.members.students}
      eligibleInstructors={data.eligibleInstructors}
      isOwnerOrAdmin={data.isOwnerOrAdmin}
    />
  {:else if activeTab === 'settings'}
    <div class="space-y-6">
      <Card class="space-y-5">
        <h2 class="text-base font-bold text-ink">{$t('manage.settingsTitle')}</h2>
        <CourseSettingsForm course={data.course} />
      </Card>

      <Card class="flex flex-wrap items-center justify-between gap-4 border-danger/40">
        <div>
          <h2 class="font-bold text-danger">{$t('manage.deleteCourseTitle')}</h2>
          <p class="mt-1 text-xs text-ink-muted">{$t('manage.deleteCourseDescription')}</p>
        </div>
        <form bind:this={deleteForm} method="POST" action="?/deleteCourse"></form>
        <Button type="button" variant="danger" onclick={() => (deleteOpen = true)}>
          {$t('common.delete')}
        </Button>
      </Card>
    </div>
  {/if}
</div>

<ConfirmDialog
  bind:open={deleteOpen}
  title={$t('manage.confirmDeleteCourseTitle')}
  description={$t('manage.confirmDeleteCourse')}
  confirmText={$t('common.delete')}
  cancelText={$t('common.cancel')}
  onConfirm={() => deleteForm?.requestSubmit()}
/>
