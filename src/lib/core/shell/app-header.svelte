<script lang="ts">
  import { resolve } from '$app/paths';
  import { LocaleToggle, Logo, ThemeToggle } from 'cset-ui';
  import type { SessionUser } from '$lib/core/auth/session-user';
  import { locale, setLocale, t } from '$lib/core/i18n';
  import AppNav from './app-nav.svelte';
  import UserMenu from './user-menu.svelte';

  let { user }: { user: SessionUser } = $props();
</script>

<header class="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
  <div class="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-8">
    <div class="flex items-center gap-6">
      <a href={resolve('/')} class="flex items-center" aria-label={$t('nav.home')}>
        <Logo size={1.4} />
      </a>
      <AppNav role={user.role} />
    </div>
    <div class="flex items-center gap-3">
      <LocaleToggle value={$locale} onLocaleChange={setLocale} />
      <ThemeToggle />
      <UserMenu {user} />
    </div>
  </div>
  <AppNav role={user.role} mobile />
</header>
