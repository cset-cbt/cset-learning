<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { Button, Card, FormMessage, InputField, PageHeader, toast } from 'cset-ui';
  import { authClient } from '$lib/core/auth/auth-client';
  import { mapAuthError } from '$lib/core/auth/auth-errors';
  import { eventValue } from '$lib/core/forms/event-value';
  import { t, type MessageKey } from '$lib/core/i18n';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let name = $derived(data.user.name);
  let currentPassword = $state('');
  let newPassword = $state('');
  let profileBusy = $state(false);
  let passwordBusy = $state(false);
  let passwordError = $state<MessageKey | null>(null);

  async function saveProfile(event: SubmitEvent) {
    event.preventDefault();
    profileBusy = true;
    const { error } = await authClient.updateUser({ name: name.trim() });
    profileBusy = false;
    if (error) {
      toast.error($t(mapAuthError(error)));
      return;
    }
    toast.success($t('account.profile.saved'));
    await invalidateAll();
  }

  async function changePassword(event: SubmitEvent) {
    event.preventDefault();
    passwordBusy = true;
    passwordError = null;
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true
    });
    passwordBusy = false;
    if (error) {
      passwordError = mapAuthError(error);
      return;
    }
    currentPassword = '';
    newPassword = '';
    toast.success($t('account.password.saved'));
  }
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <PageHeader eyebrow={$t('account.eyebrow')} title={$t('account.title')}>
    {$t('account.description')}
  </PageHeader>

  <Card class="space-y-4 p-6">
    <h2 class="text-lg font-bold text-ink">{$t('account.profile.title')}</h2>
    <dl class="mono-label grid gap-1 text-xs text-ink-muted">
      <div class="flex gap-3">
        <dt>{$t('account.email')}</dt>
        <dd class="text-ink normal-case">{data.user.email}</dd>
      </div>
      <div class="flex gap-3">
        <dt>{$t('account.role')}</dt>
        <dd class="text-ink normal-case">{$t(`account.role.${data.user.role}`)}</dd>
      </div>
    </dl>
    <form class="space-y-4" onsubmit={saveProfile}>
      <InputField
        label={$t('account.profile.name')}
        name="name"
        autocomplete="name"
        required
        maxlength={120}
        value={name}
        oninput={(event: Event) => (name = eventValue(event))}
      />
      <Button type="submit" disabled={profileBusy}>{$t('account.profile.save')}</Button>
    </form>
  </Card>

  <Card class="space-y-4 p-6">
    <h2 class="text-lg font-bold text-ink">{$t('account.password.title')}</h2>
    <form class="space-y-4" onsubmit={changePassword}>
      <InputField
        label={$t('account.password.current')}
        name="currentPassword"
        type="password"
        autocomplete="current-password"
        required
        value={currentPassword}
        oninput={(event: Event) => (currentPassword = eventValue(event))}
      />
      <InputField
        label={$t('account.password.new')}
        name="newPassword"
        type="password"
        autocomplete="new-password"
        required
        minlength={8}
        maxlength={128}
        value={newPassword}
        oninput={(event: Event) => (newPassword = eventValue(event))}
      />
      {#if passwordError}
        <FormMessage variant="error">{$t(passwordError)}</FormMessage>
      {/if}
      <Button type="submit" disabled={passwordBusy}>{$t('account.password.save')}</Button>
    </form>
  </Card>
</div>
