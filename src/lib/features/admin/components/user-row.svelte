<script lang="ts">
  import { enhance } from '$app/forms';
  import { Badge, Button, Select } from 'cset-ui';
  import { USER_ROLES } from '$lib/core/auth/session-user';
  import { locale, t } from '$lib/core/i18n';
  import type { AdminUserRow } from '../shared/admin-types';
  import { submitWithToast } from './submit-with-toast';

  let {
    user,
    isSelf,
    onResetPassword,
    onBan
  }: {
    user: AdminUserRow;
    isSelf: boolean;
    onResetPassword: (_user: AdminUserRow) => void;
    onBan: (_user: AdminUserRow) => void;
  } = $props();

  // Writable derived: follows the server value, but the select can override it until saved.
  let role = $derived<string>(user.role);

  const roleItems = $derived(
    USER_ROLES.map((value) => ({ value, label: $t(`account.role.${value}`) }))
  );
  const created = $derived(
    new Date(user.createdAt).toLocaleDateString($locale === 'vi' ? 'vi-VN' : 'en-US')
  );
</script>

<tr class="border-b border-border align-middle">
  <td class="px-4 py-3 font-semibold text-ink">
    {user.name}
    {#if isSelf}
      <Badge variant="outline" color="neutral">{$t('admin.you')}</Badge>
    {/if}
  </td>
  <td class="px-4 py-3 text-ink-muted">{user.email}</td>
  <td class="px-4 py-3">
    <form
      method="POST"
      action="?/setRole"
      class="flex items-center gap-2"
      use:enhance={submitWithToast('admin.role.saved')}
    >
      <input type="hidden" name="userId" value={user.id} />
      <div class="w-40">
        <Select name="role" items={roleItems} bind:value={role} disabled={isSelf} size="sm" />
      </div>
      <Button type="submit" variant="secondary" class="btn-control-sm" disabled={isSelf || role === user.role}>
        {$t('admin.role.save')}
      </Button>
    </form>
  </td>
  <td class="px-4 py-3">
    {#if user.banned}
      <Badge color="rose" variant="soft">{$t('admin.status.banned')}</Badge>
    {:else}
      <Badge color="emerald" variant="soft">{$t('admin.status.active')}</Badge>
    {/if}
  </td>
  <td class="px-4 py-3 text-ink-muted">{created}</td>
  <td class="px-4 py-3">
    <div class="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" class="btn-control-sm" onclick={() => onResetPassword(user)}>
        {$t('admin.password.open')}
      </Button>
      {#if !isSelf}
        {#if user.banned}
          <form
            method="POST"
            action="?/unban"
            use:enhance={submitWithToast('admin.unban.saved')}
          >
            <input type="hidden" name="userId" value={user.id} />
            <Button type="submit" variant="secondary" class="btn-control-sm">{$t('admin.unban.open')}</Button>
          </form>
        {:else}
          <Button type="button" variant="danger" class="btn-control-sm" onclick={() => onBan(user)}>
            {$t('admin.ban.open')}
          </Button>
        {/if}
      {/if}
    </div>
  </td>
</tr>
