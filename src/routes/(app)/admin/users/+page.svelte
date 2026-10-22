<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { Button, InputField, PageHeader, Pagination } from 'cset-ui';
  import { eventValue } from '$lib/core/forms/event-value';
  import { t } from '$lib/core/i18n';
  import UserTable from '$lib/features/admin/components/user-table.svelte';
  import { ADMIN_PAGE_SIZE } from '$lib/features/admin/shared/admin-validation';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let search = $derived(data.q);
  // Writable derived: the pagination control updates it, the effect below navigates.
  let pageNumber = $derived(data.page);

  $effect(() => {
    if (pageNumber === data.page) return;
    const params = new URLSearchParams();
    if (data.q) params.set('q', data.q);
    if (pageNumber > 1) params.set('page', String(pageNumber));
    const suffix = params.size > 0 ? `?${params}` : '';
    // The path comes from resolve(); only the validated query string is appended.
    // eslint-disable-next-line svelte/no-navigation-without-resolve
    void goto(`${resolve('/admin/users')}${suffix}`);
  });
</script>

<div class="space-y-6">
  <PageHeader eyebrow={$t('admin.eyebrow')} title={$t('admin.title')}>
    {$t('admin.description')}
  </PageHeader>

  <form method="GET" action={resolve('/admin/users')} class="flex flex-wrap items-end gap-3">
    <div class="w-full max-w-sm">
      <InputField
        label={$t('admin.search.label')}
        name="q"
        type="search"
        maxlength={100}
        value={search}
        oninput={(event: Event) => (search = eventValue(event))}
      />
    </div>
    <Button type="submit">{$t('admin.search.submit')}</Button>
    {#if data.q}
      <Button href={resolve('/admin/users')} variant="secondary">{$t('admin.search.clear')}</Button>
    {/if}
  </form>

  <p class="mono-label text-xs text-ink-muted">{$t('admin.total', { count: data.total })}</p>

  <UserTable users={data.users} currentUserId={data.user.id} />

  {#if data.total > ADMIN_PAGE_SIZE}
    <Pagination bind:page={pageNumber} total={data.total} pageSize={ADMIN_PAGE_SIZE} />
  {/if}
</div>
