<script lang="ts">
  import { enhance } from '$app/forms';
  import { Button, Dialog, InputField } from 'cset-ui';
  import { eventValue } from '$lib/core/forms/event-value';
  import { t } from '$lib/core/i18n';
  import type { AdminUserRow } from '../shared/admin-types';
  import { submitWithToast } from './submit-with-toast';

  let { open = $bindable(false), user }: { open: boolean; user: AdminUserRow | null } = $props();

  let newPassword = $state('');

  // Never keep a typed password around once the dialog is closed.
  $effect(() => {
    if (!open) newPassword = '';
  });
</script>

<Dialog
  bind:open
  title={$t('admin.password.title', { name: user?.name ?? '' })}
  description={$t('admin.password.description')}
  size="md"
>
  {#if user}
    <form
      method="POST"
      action="?/setPassword"
      class="space-y-4"
      use:enhance={submitWithToast('admin.password.saved', () => (open = false))}
    >
      <input type="hidden" name="userId" value={user.id} />
      <InputField
        label={$t('admin.password.field')}
        name="newPassword"
        type="password"
        autocomplete="new-password"
        required
        minlength={8}
        maxlength={128}
        value={newPassword}
        oninput={(event: Event) => (newPassword = eventValue(event))}
      />
      <div class="flex justify-end gap-2">
        <Button type="button" variant="secondary" onclick={() => (open = false)}>
          {$t('common.cancel')}
        </Button>
        <Button type="submit">{$t('admin.password.submit')}</Button>
      </div>
    </form>
  {/if}
</Dialog>
