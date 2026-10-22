<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { Button, Card, FormMessage, InputField, toast } from 'cset-ui';
  import AvatarCard from '$lib/core/shell/avatar-card.svelte';
  import ProfileHero from '$lib/core/shell/profile-hero.svelte';
  import PrivilegesCard from '$lib/core/shell/privileges-card.svelte';
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

<div class="w-full space-y-8">
  <ProfileHero user={data.user} />

  <div class="grid w-full gap-6 lg:grid-cols-12">
    <!-- Left Column: Avatar & Personal Information -->
    <div class="space-y-6 lg:col-span-6">
      <AvatarCard user={data.user} />

      <Card class="space-y-5 p-6">
        <div>
          <h2 class="text-lg font-bold text-ink">{$t('account.profile.title')}</h2>
          <p class="mt-1 text-sm text-ink-muted">{$t('account.description')}</p>
        </div>

        <dl class="mono-label grid gap-2 text-xs text-ink-muted border-t border-b border-border py-3">
          <div class="flex items-center justify-between">
            <dt>{$t('account.email')}</dt>
            <dd class="text-ink normal-case font-mono font-semibold">{data.user.email}</dd>
          </div>
          <div class="flex items-center justify-between">
            <dt>{$t('account.role')}</dt>
            <dd class="text-ink normal-case font-sans font-semibold">
              {$t(`account.role.${data.user.role}`)}
            </dd>
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
    </div>

    <!-- Right Column: Security/Password & Account Privileges -->
    <div class="space-y-6 lg:col-span-6">
      <Card class="space-y-5 p-6">
        <div>
          <h2 class="text-lg font-bold text-ink">{$t('account.password.title')}</h2>
          <p class="mt-1 text-sm text-ink-muted leading-relaxed">
            {$t('account.password.sessionsNote')}
          </p>
        </div>

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

      <PrivilegesCard user={data.user} />
    </div>
  </div>
</div>
