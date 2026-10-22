<script lang="ts">
  import { enhance } from '$app/forms';
  import { Button, Dialog, InputField } from 'cset-ui';
  import { eventValue } from '$lib/core/forms/event-value';
  import { t } from '$lib/core/i18n';
  import type { AdminUserRow } from '../shared/admin-types';
  import { submitWithToast } from './submit-with-toast';

  let { open = $bindable(false), user }: { open: boolean; user: AdminUserRow | null } = $props();

  let reason = $state('');

  $effect(() => {
    if (!open) reason = '';
  });
</script>

<Dialog
  bind:open
  title={$t('admin.ban.title', { name: user?.name ?? '' })}
  description={$t('admin.ban.description')}
  size="md"
>
  {#if user}
    <form
      method="POST"
      action="?/ban"
      class="space-y-4"
      use:enhance={submitWithToast('admin.ban.saved', () => (open = false))}
    >
      <input type="hidden" name="userId" value={user.id} />
      <InputField
        label={$t('admin.ban.reason')}
        name="banReason"
        maxlength={200}
        value={reason}
        oninput={(event: Event) => (reason = eventValue(event))}
      />
      <div class="flex justify-end gap-2">
        <Button type="button" variant="secondary" onclick={() => (open = false)}>
          {$t('common.cancel')}
        </Button>
        <Button type="submit" variant="danger">{$t('admin.ban.submit')}</Button>
      </div>
    </form>
  {/if}
</Dialog>
