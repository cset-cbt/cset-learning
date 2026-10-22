<script lang="ts">
  import { Avatar, Badge, Button, Card, ConfirmDialog, Dialog, Select, type SelectOption } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import type { CourseInstructorMember } from '../server/course-members-service';

  let {
    instructors,
    eligibleInstructors,
    isOwnerOrAdmin
  }: {
    instructors: CourseInstructorMember[];
    eligibleInstructors: Array<{ id: string; name: string; email: string }>;
    isOwnerOrAdmin: boolean;
  } = $props();

  let addOpen = $state(false);
  let selectedId = $state('');
  let role = $state<'instructor' | 'assistant'>('instructor');

  let removeId = $state<string | null>(null);
  let confirmOpen = $state(false);
  let removeForm = $state<HTMLFormElement | null>(null);

  const eligibleOptions = $derived<SelectOption[]>(
    eligibleInstructors.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }))
  );

  const roleOptions: SelectOption[] = [
    { value: 'instructor', label: 'Giảng viên' },
    { value: 'assistant', label: 'Trợ giảng' }
  ];

  function handlePromptRemove(id: string) {
    removeId = id;
    confirmOpen = true;
  }
</script>

<Card class="space-y-5 p-6">
  <div class="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 class="text-base font-bold text-ink">{$t('manage.members.instructorsTitle')}</h2>
      <p class="mt-0.5 text-xs text-ink-muted">{$t('manage.members.instructorsDescription')}</p>
    </div>

    {#if isOwnerOrAdmin && eligibleInstructors.length > 0}
      <Button
        type="button"
        variant="secondary"
        class="h-8 px-3 text-xs"
        onclick={() => {
          selectedId = eligibleInstructors[0]?.id ?? '';
          addOpen = true;
        }}
      >
        <svg class="mr-1.5 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M5 12h14m-7-7v14" />
        </svg>
        {$t('manage.members.addInstructor')}
      </Button>
    {/if}
  </div>

  <div class="space-y-3">
    {#each instructors as item (item.userId)}
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface p-3.5">
        <div class="flex items-center gap-3">
          <Avatar src={item.image} name={item.name} size="sm" />
          <div>
            <div class="flex items-center gap-2">
              <span class="font-sans text-sm font-semibold text-ink">{item.name}</span>
              <Badge
                variant="soft"
                color={item.isOwner ? 'purple' : item.role === 'assistant' ? 'emerald' : 'accent'}
                size="sm"
              >
                {$t(`manage.members.role.${item.isOwner ? 'owner' : item.role}`)}
              </Badge>
            </div>
            <p class="font-mono text-xs text-ink-muted">{item.email}</p>
          </div>
        </div>

        {#if isOwnerOrAdmin && !item.isOwner}
          <Button
            type="button"
            variant="danger"
            class="h-7 px-2.5 text-xs"
            onclick={() => handlePromptRemove(item.userId)}
          >
            {$t('common.delete')}
          </Button>
        {/if}
      </div>
    {/each}
  </div>
</Card>

<Dialog bind:open={addOpen} title={$t('manage.members.addInstructor')} size="md">
  <form method="POST" action="?/assignInstructor" class="space-y-4" onsubmit={() => (addOpen = false)}>
    <Select label={$t('manage.members.selectInstructor')} items={eligibleOptions} bind:value={selectedId} name="targetUserId" />
    <Select label={$t('manage.members.instructorRole')} items={roleOptions} bind:value={role} name="role" />
    <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
      <Button type="button" variant="secondary" onclick={() => (addOpen = false)}>{$t('common.cancel')}</Button>
      <Button type="submit">{$t('manage.members.addInstructor')}</Button>
    </div>
  </form>
</Dialog>

<form bind:this={removeForm} method="POST" action="?/removeInstructor" class="hidden">
  <input type="hidden" name="targetUserId" value={removeId ?? ''} />
</form>
<ConfirmDialog
  bind:open={confirmOpen}
  title={$t('manage.members.instructorsTitle')}
  description={$t('manage.members.removeInstructorConfirm')}
  confirmText={$t('common.delete')}
  cancelText={$t('common.cancel')}
  onConfirm={() => removeForm?.requestSubmit()}
/>
