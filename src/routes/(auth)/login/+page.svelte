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

  let email = $state('');
  let password = $state('');
  let errorKey = $state<MessageKey | null>(null);
  let busy = $state(false);

  function fillDemo(demoEmail: string, demoPassword: string) {
    email = demoEmail;
    password = demoPassword;
    errorKey = null;
  }

  async function onsubmit(event: SubmitEvent) {
    event.preventDefault();
    busy = true;
    errorKey = null;
    const { error } = await authClient.signIn.email({ email: email.trim(), password });
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
  <PageHeader eyebrow="CSET LEARNING" title={$t('auth.login.title')}>
    {$t('auth.login.description')}
  </PageHeader>

  <!-- Demo Quick Fill Buttons -->
  <div class="space-y-2 rounded-lg border border-border bg-surface-muted/30 p-3.5">
    <div class="flex items-center justify-between">
      <span class="mono-label text-[0.68rem] text-ink-muted uppercase">{$t('auth.login.demoTitle')}</span>
      <span class="font-mono text-[0.62rem] text-accent font-bold">CSET DEMO</span>
    </div>

    <div class="grid grid-cols-3 gap-2">
      <button
        type="button"
        class="flex flex-col items-center justify-center rounded border border-border bg-surface px-2 py-2 text-center transition-all hover:border-accent hover:bg-accent/5 cursor-pointer shadow-2xs"
        onclick={() => fillDemo('admin@cset.club', 'Cset@2026!')}
      >
        <span class="font-sans text-xs font-bold text-ink">{$t('account.role.admin')}</span>
        <span class="font-mono text-[0.62rem] text-ink-muted mt-0.5">admin</span>
      </button>

      <button
        type="button"
        class="flex flex-col items-center justify-center rounded border border-border bg-surface px-2 py-2 text-center transition-all hover:border-accent hover:bg-accent/5 cursor-pointer shadow-2xs"
        onclick={() => fillDemo('instructor@cset.club', 'Cset@2026!')}
      >
        <span class="font-sans text-xs font-bold text-ink">{$t('account.role.instructor')}</span>
        <span class="font-mono text-[0.62rem] text-ink-muted mt-0.5">instructor</span>
      </button>

      <button
        type="button"
        class="flex flex-col items-center justify-center rounded border border-border bg-surface px-2 py-2 text-center transition-all hover:border-accent hover:bg-accent/5 cursor-pointer shadow-2xs"
        onclick={() => fillDemo('student@cset.club', 'Cset@2026!')}
      >
        <span class="font-sans text-xs font-bold text-ink">{$t('account.role.student')}</span>
        <span class="font-mono text-[0.62rem] text-ink-muted mt-0.5">student</span>
      </button>
    </div>
  </div>

  <form class="space-y-4" {onsubmit}>
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
      autocomplete="current-password"
      required
      minlength={8}
      value={password}
      oninput={(event: Event) => (password = eventValue(event))}
    />
    {#if errorKey}
      <FormMessage variant="error">{$t(errorKey)}</FormMessage>
    {/if}
    <Button type="submit" class="w-full" disabled={busy}>{$t('auth.login.submit')}</Button>
  </form>

  <p class="text-xs text-ink-muted">{$t('auth.login.forgot')}</p>
  <a href={resolve('/register')} class="mono-label block text-xs text-accent hover:underline">
    {$t('auth.login.switch')}
  </a>
</Card>
