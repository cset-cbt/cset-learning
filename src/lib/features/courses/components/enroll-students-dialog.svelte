<script lang="ts">
  import { Avatar, Button, Dialog, InputField } from 'cset-ui';
  import { eventValue } from '$lib/core/forms/event-value';
  import { t } from '$lib/core/i18n';

  type UserSearchItem = { id: string; name: string; email: string; role: string; image: string | null };

  let {
    open = $bindable(false),
    courseId
  }: {
    open?: boolean;
    courseId: string;
  } = $props();

  let searchQuery = $state('');
  let searchResults = $state<UserSearchItem[]>([]);
  let isSearching = $state(false);
  let selectedStudents = $state<UserSearchItem[]>([]);
  let searchTimer: ReturnType<typeof setTimeout> | undefined;

  async function fetchStudents(query: string) {
    isSearching = true;
    try {
      const res = await fetch(`/api/users/search?courseId=${courseId}&q=${encodeURIComponent(query)}&limit=20`);
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
      fetchStudents(searchQuery);
    }, 250);
  }

  $effect(() => {
    if (open) {
      searchQuery = '';
      selectedStudents = [];
      fetchStudents('');
    }
  });

  function toggleStudent(user: UserSearchItem) {
    const exists = selectedStudents.some((s) => s.id === user.id);
    if (exists) {
      selectedStudents = selectedStudents.filter((s) => s.id !== user.id);
    } else {
      selectedStudents = [...selectedStudents, user];
    }
  }

  function removeSelected(userId: string) {
    selectedStudents = selectedStudents.filter((s) => s.id !== userId);
  }
</script>

<Dialog bind:open title={$t('manage.members.enrollStudent')} size="lg">
  <form method="POST" action="?/enrollStudents" class="space-y-4" onsubmit={() => (open = false)}>
    <InputField
      label={$t('manage.members.searchPlaceholder')}
      name="search"
      value={searchQuery}
      oninput={handleSearchInput}
      placeholder="Tìm theo tên hoặc email học viên..."
    />

    <!-- Search Results / Selectable List -->
    <div class="space-y-2">
      <div class="flex items-center justify-between text-xs text-ink-muted">
        <span>KẾT QUẢ TÌM KIẾM ({searchResults.length})</span>
        {#if isSearching}<span>{$t('manage.members.searching')}</span>{/if}
      </div>

      <div class="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border bg-surface-muted/20 p-2">
        {#each searchResults as u (u.id)}
          {@const isSelected = selectedStudents.some((s) => s.id === u.id)}
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 rounded border p-2 text-left transition-colors cursor-pointer {isSelected ? 'border-accent bg-accent/10 shadow-xs' : 'border-transparent bg-surface hover:border-border-strong hover:bg-surface-muted/50'}"
            onclick={() => toggleStudent(u)}
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="grid h-4 w-4 place-items-center rounded border {isSelected ? 'border-accent bg-accent text-white' : 'border-border-strong'} shrink-0">
                {#if isSelected}
                  <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                {/if}
              </div>
              <Avatar src={u.image} name={u.name} size="xs" />
              <div class="min-w-0">
                <p class="truncate text-xs font-semibold text-ink">{u.name}</p>
                <p class="truncate font-mono text-[0.68rem] text-ink-muted">{u.email}</p>
              </div>
            </div>
            <span class="text-[0.65rem] font-mono text-ink-muted uppercase">{isSelected ? 'ĐÃ CHỌN' : '+ THÊM'}</span>
          </button>
        {:else}
          <p class="py-6 text-center text-xs text-ink-muted">{$t('manage.members.noUsersFound')}</p>
        {/each}
      </div>
    </div>

    <!-- Selected Students List -->
    <div class="space-y-2 border-t border-border pt-3">
      <div class="flex items-center justify-between text-xs font-semibold text-ink">
        <span>{$t('manage.members.selectedStudents', { count: selectedStudents.length })}</span>
        {#if selectedStudents.length > 0}
          <button type="button" class="text-xs text-danger hover:underline cursor-pointer" onclick={() => (selectedStudents = [])}>
            {$t('manage.members.clearSelected')}
          </button>
        {/if}
      </div>

      {#if selectedStudents.length === 0}
        <p class="py-3 text-center text-xs text-ink-muted">Chưa chọn học viên nào. Nhấp vào kết quả tìm kiếm để thêm.</p>
      {:else}
        <div class="max-h-36 space-y-1.5 overflow-y-auto rounded-md border border-border bg-surface p-2">
          {#each selectedStudents as item (item.id)}
            <div class="flex items-center justify-between gap-2 rounded bg-surface-muted/40 px-2.5 py-1.5 text-xs">
              <div class="flex items-center gap-2 min-w-0">
                <Avatar src={item.image} name={item.name} size="xs" />
                <span class="font-semibold text-ink truncate">{item.name}</span>
                <span class="font-mono text-[0.68rem] text-ink-muted truncate">({item.email})</span>
              </div>
              <button
                type="button"
                class="grid h-5 w-5 place-items-center rounded text-ink-muted hover:bg-danger/20 hover:text-danger cursor-pointer"
                onclick={() => removeSelected(item.id)}
                title="Bỏ chọn"
              >
                &times;
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Hidden input with userIds -->
    <input type="hidden" name="userIds" value={JSON.stringify(selectedStudents.map((s) => s.id))} />

    <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
      <Button type="button" variant="secondary" onclick={() => (open = false)}>{$t('common.cancel')}</Button>
      <Button type="submit" disabled={selectedStudents.length === 0}>
        {$t('manage.members.enrollBatch', { count: selectedStudents.length })}
      </Button>
    </div>
  </form>
</Dialog>
