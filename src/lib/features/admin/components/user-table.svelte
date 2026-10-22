<script lang="ts">
  import { Table } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import type { AdminUserRow } from '../shared/admin-types';
  import BanDialog from './ban-dialog.svelte';
  import SetPasswordDialog from './set-password-dialog.svelte';
  import UserRow from './user-row.svelte';

  let { users, currentUserId }: { users: AdminUserRow[]; currentUserId: string } = $props();

  let passwordOpen = $state(false);
  let banOpen = $state(false);
  let target = $state<AdminUserRow | null>(null);

  function openPassword(user: AdminUserRow) {
    target = user;
    passwordOpen = true;
  }

  function openBan(user: AdminUserRow) {
    target = user;
    banOpen = true;
  }
</script>

{#if users.length === 0}
  <p class="text-sm text-ink-muted">{$t('admin.empty')}</p>
{:else}
  <Table striped>
    <thead>
      <tr class="mono-label border-b border-border text-[0.68rem] text-ink-muted">
        <th class="px-4 py-3">{$t('admin.table.name')}</th>
        <th class="px-4 py-3">{$t('admin.table.email')}</th>
        <th class="px-4 py-3">{$t('admin.table.role')}</th>
        <th class="px-4 py-3">{$t('admin.table.status')}</th>
        <th class="px-4 py-3">{$t('admin.table.created')}</th>
        <th class="px-4 py-3">{$t('admin.table.actions')}</th>
      </tr>
    </thead>
    <tbody>
      {#each users as user (user.id)}
        <UserRow
          {user}
          isSelf={user.id === currentUserId}
          onResetPassword={openPassword}
          onBan={openBan}
        />
      {/each}
    </tbody>
  </Table>
{/if}

<SetPasswordDialog bind:open={passwordOpen} user={target} />
<BanDialog bind:open={banOpen} user={target} />
