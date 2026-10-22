<script lang="ts">
  import { Avatar, Badge, Button, Card, ConfirmDialog, Dialog, InputField } from 'cset-ui';
  import ProgressBar from '$lib/core/shell/progress-bar.svelte';
  import { eventValue } from '$lib/core/forms/event-value';
  import { t } from '$lib/core/i18n';
  import type { CourseStudentMember } from '../server/course-members-service';

  let { students }: { students: CourseStudentMember[] } = $props();

  let enrollOpen = $state(false);
  let studentEmail = $state('');

  let unenrollId = $state<string | null>(null);
  let confirmOpen = $state(false);
  let unenrollForm = $state<HTMLFormElement | null>(null);

  function handlePromptUnenroll(id: string) {
    unenrollId = id;
    confirmOpen = true;
  }
</script>

<Card class="space-y-5 p-6">
  <div class="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex items-center gap-3">
      <div>
        <h2 class="text-base font-bold text-ink">{$t('manage.members.studentsTitle')}</h2>
        <p class="mt-0.5 text-xs text-ink-muted">{$t('manage.members.studentsDescription')}</p>
      </div>
      <Badge variant="soft" color="neutral" size="sm">{students.length}</Badge>
    </div>

    <Button type="button" variant="secondary" class="h-8 px-3 text-xs" onclick={() => (enrollOpen = true)}>
      <svg class="mr-1.5 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M5 12h14m-7-7v14" />
      </svg>
      {$t('manage.members.enrollStudent')}
    </Button>
  </div>

  {#if students.length === 0}
    <p class="py-6 text-center text-xs text-ink-muted">{$t('manage.members.emptyStudents')}</p>
  {:else}
    <div class="space-y-3">
      {#each students as student (student.userId)}
        <div class="flex flex-col gap-3 rounded-md border border-border bg-surface p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <Avatar src={student.image} name={student.name} size="sm" />
            <div>
              <span class="font-sans text-sm font-semibold text-ink">{student.name}</span>
              <p class="font-mono text-xs text-ink-muted">{student.email}</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <div class="w-36 space-y-1">
              <div class="flex items-center justify-between font-mono text-[0.68rem] text-ink-muted">
                <span>{$t('manage.members.progress')}</span>
                <span>{student.completedItems}/{student.totalItems}</span>
              </div>
              <ProgressBar value={student.completedItems} max={student.totalItems} label={$t('manage.members.progress')} />
            </div>

            <span class="font-mono text-xs text-ink-muted">
              {new Date(student.enrolledAt).toLocaleDateString()}
            </span>

            <Button
              type="button"
              variant="danger"
              class="h-7 px-2.5 text-xs"
              onclick={() => handlePromptUnenroll(student.userId)}
            >
              {$t('common.delete')}
            </Button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</Card>

<Dialog bind:open={enrollOpen} title={$t('manage.members.enrollStudent')} size="sm">
  <form method="POST" action="?/enrollStudent" class="space-y-4" onsubmit={() => (enrollOpen = false)}>
    <InputField
      label={$t('manage.members.studentEmail')}
      name="email"
      type="email"
      required
      value={studentEmail}
      oninput={(e: Event) => (studentEmail = eventValue(e))}
      placeholder="hocvien@cset.club"
    />
    <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
      <Button type="button" variant="secondary" onclick={() => (enrollOpen = false)}>{$t('common.cancel')}</Button>
      <Button type="submit">{$t('manage.members.enrollStudent')}</Button>
    </div>
  </form>
</Dialog>

<form bind:this={unenrollForm} method="POST" action="?/unenrollStudent" class="hidden">
  <input type="hidden" name="targetUserId" value={unenrollId ?? ''} />
</form>
<ConfirmDialog
  bind:open={confirmOpen}
  title={$t('manage.members.studentsTitle')}
  description={$t('manage.members.unenrollConfirm')}
  confirmText={$t('common.delete')}
  cancelText={$t('common.cancel')}
  onConfirm={() => unenrollForm?.requestSubmit()}
/>
