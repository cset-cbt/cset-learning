<script lang="ts">
  import { Avatar, Badge, Button, Card, ConfirmDialog, Dialog, InputField, Select, type SelectOption } from 'cset-ui';
  import { eventValue } from '$lib/core/forms/event-value';
  import { t } from '$lib/core/i18n';
  import type { CourseInstructorMember } from '../server/course-members-service';

  type UserSearchItem = { id: string; name: string; email: string; role: string; image: string | null };

  let {
    courseId,
    instructors,
    eligibleInstructors,
    isOwnerOrAdmin
  }: {
    courseId: string;
    instructors: CourseInstructorMember[];
    eligibleInstructors: Array<{ id: string; name: string; email: string }>;
    isOwnerOrAdmin: boolean;
  } = $props();

  let addOpen = $state(false);
  let searchQuery = $state('');
  let searchResults = $state<UserSearchItem[]>([]);
  let isSearching = $state(false);
  let selectedInstructor = $state<UserSearchItem | null>(null);
  let role = $state<'instructor' | 'assistant'>('instructor');

  let removeId = $state<string | null>(null);
  let confirmOpen = $state(false);
  let removeForm = $state<HTMLFormElement | null>(null);

  const roleOptions: SelectOption[] = [
    { value: 'instructor', label: 'Giảng viên' },
    { value: 'assistant', label: 'Trợ giảng' }
  ];

  let searchTimer: ReturnType<typeof setTimeout> | undefined;

  async function fetchInstructors(query: string) {
    isSearching = true;
    try {
      const res = await fetch(`/api/users/search?role=instructor&courseId=${courseId}&q=${encodeURIComponent(query)}&limit=20`);
      if (res.ok) {
        const data = (await res.json()) as { users: UserSearchItem[] };
        searchResults = data.users || [];
      }
    } catch {
      searchResults = [];
    } finally {
      isSearching = false;
    }
  }

  function handleSearchInput(e: Event) {
    searchQuery = eventValue(e);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      fetchInstructors(searchQuery);
    }, 250);
  }

  function handleOpenDialog() {
    searchQuery = '';
    selectedInstructor = null;
    addOpen = true;
    fetchInstructors('');
  }

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

    {#if isOwnerOrAdmin}
      <Button type="button" variant="secondary" class="h-8 px-3 text-xs" onclick={handleOpenDialog}>
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

<Dialog bind:open={addOpen} title={$t('manage.members.addInstructor')} description={$t('manage.members.singleSelectNotice')} size="lg">
  <form method="POST" action="?/assignInstructor" class="space-y-4" onsubmit={() => (addOpen = false)}>
    <InputField
      label={$t('manage.members.searchPlaceholder')}
      name="search"
      value={searchQuery}
      oninput={handleSearchInput}
      placeholder="Tìm theo tên hoặc email giảng viên..."
    />

    <!-- Search Results / Selection list -->
    <div class="space-y-2">
      <div class="flex items-center justify-between text-xs text-ink-muted">
        <span>KẾT QUẢ TÌM KIẾM ({searchResults.length})</span>
        {#if isSearching}<span>{$t('manage.members.searching')}</span>{/if}
      </div>

      <div class="max-h-56 space-y-1.5 overflow-y-auto rounded-md border border-border bg-surface-muted/20 p-2">
        {#each searchResults as u (u.id)}
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 rounded border p-2.5 text-left transition-colors cursor-pointer {selectedInstructor?.id === u.id ? 'border-accent bg-accent/10 shadow-xs' : 'border-transparent bg-surface hover:border-border-strong hover:bg-surface-muted/50'}"
            onclick={() => (selectedInstructor = u)}
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <Avatar src={u.image} name={u.name} size="xs" />
              <div class="min-w-0">
                <p class="truncate text-xs font-semibold text-ink">{u.name}</p>
                <p class="truncate font-mono text-[0.68rem] text-ink-muted">{u.email}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <Badge variant="soft" color="neutral" size="sm">{u.role}</Badge>
              {#if selectedInstructor?.id === u.id}
                <svg class="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              {/if}
            </div>
          </button>
        {:else}
          <p class="py-6 text-center text-xs text-ink-muted">{$t('manage.members.noUsersFound')}</p>
        {/each}
      </div>
    </div>

    {#if selectedInstructor}
      <input type="hidden" name="targetUserId" value={selectedInstructor.id} />
    {/if}

    <Select label={$t('manage.members.instructorRole')} items={roleOptions} bind:value={role} name="role" />

    <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
      <Button type="button" variant="secondary" onclick={() => (addOpen = false)}>{$t('common.cancel')}</Button>
      <Button type="submit" disabled={!selectedInstructor}>{$t('manage.members.addInstructor')}</Button>
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
