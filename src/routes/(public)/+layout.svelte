<script lang="ts">
  import type { Snippet } from 'svelte';
  import { resolve } from '$app/paths';
  import { LocaleToggle, Logo, ThemeToggle } from 'cset-ui';
  import { locale, setLocale, t } from '$lib/core/i18n';
  import AppFooter from '$lib/core/shell/app-footer.svelte';

  let { children }: { children?: Snippet } = $props();
</script>

<div class="flex min-h-[100dvh] flex-col">
  <header class="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
    <a href={resolve('/')} aria-label={$t('nav.home')}><Logo size={1.5} /></a>
    <div class="flex items-center gap-3">
      <LocaleToggle value={$locale} onLocaleChange={setLocale} />
      <ThemeToggle />
    </div>
  </header>
  <main class="mx-auto w-full max-w-6xl flex-1 px-4 pb-12 sm:px-8">
    {@render children?.()}
  </main>
  <AppFooter />
</div>
