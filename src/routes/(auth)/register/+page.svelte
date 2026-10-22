<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { Button, Card, FormMessage, InputField, PageHeader } from 'cset-ui';
  import { authClient } from '$lib/core/auth/auth-client';
  import { mapAuthError } from '$lib/core/auth/auth-errors';
  import { safeNextPath } from '$lib/core/auth/safe-next-path';
  import { eventValue } from '$lib/core/forms/event-value';
  import { t, type MessageKey } from '$lib/core/i18n';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let errorKey = $state<MessageKey | null>(null);
  let busy = $state(false);

  async function onsubmit(event: SubmitEvent) {
    event.preventDefault();
    busy = true;
    errorKey = null;
    const { error } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password
    });
    busy = false;
    if (error) {
      errorKey = mapAuthError(error);
      return;
    }
    // The target is validated by safeNextPath (same-origin absolute path only).
    // eslint-disable-next-line svelte/no-navigation-without-resolve
    await goto(safeNextPath(page.url.searchParams.get('next')), { invalidateAll: true });
  }
</script>

<Card class="space-y-6 p-6 sm:p-8">
  <PageHeader eyebrow="CSET LEARNING" title={$t('auth.register.title')}>
    {$t('auth.register.description')}
  </PageHeader>

  <form class="space-y-4" {onsubmit}>
    <InputField
      label={$t('auth.field.name')}
      name="name"
      type="text"
      autocomplete="name"
      required
      maxlength={120}
      value={name}
      oninput={(event: Event) => (name = eventValue(event))}
    />
    <InputField
      label={$t('auth.field.email')}
      name="email"
      type="email"
      autocomplete="email"
      required
      value={email}
      oninput={(event: Event) => (email = eventValue(event))}
    />
    <InputField
      label={$t('auth.field.password')}
      name="password"
      type="password"
      autocomplete="new-password"
      required
      minlength={8}
      maxlength={128}
      value={password}
      oninput={(event: Event) => (password = eventValue(event))}
    />
    <p class="text-xs text-ink-muted">{$t('auth.field.passwordHint')}</p>
    {#if errorKey}
      <FormMessage variant="error">{$t(errorKey)}</FormMessage>
    {/if}
    <Button type="submit" class="w-full" disabled={busy}>{$t('auth.register.submit')}</Button>
  </form>

  <a href={resolve('/login')} class="mono-label block text-xs text-accent hover:underline">
    {$t('auth.register.switch')}
  </a>
</Card>
