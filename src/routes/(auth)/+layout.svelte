<script lang="ts">
  import type { Snippet } from 'svelte';
  import { resolve } from '$app/paths';
  import { LocaleToggle, Logo, ThemeToggle } from 'cset-ui';
  import { locale, setLocale, t } from '$lib/core/i18n';

  let { children }: { children?: Snippet } = $props();

  const SOURCE_URL = 'https://github.com/cset-cbt/cset-learning';
</script>

<div class="flex min-h-[100dvh] flex-col">
  <header class="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-8">
    <a href={resolve('/')} aria-label={$t('nav.home')}><Logo size={1.5} /></a>
    <div class="flex items-center gap-3">
      <LocaleToggle value={$locale} onLocaleChange={setLocale} />
      <ThemeToggle />
    </div>
  </header>
  <main class="mx-auto flex w-full max-w-md flex-1 items-center px-4 pb-12">
    <div class="w-full">{@render children?.()}</div>
  </main>
  <footer class="mono-label flex items-center justify-center gap-5 pb-6 text-[0.68rem]">
    <a
      href={SOURCE_URL}
      class="text-ink-muted hover:text-ink"
      rel="noopener noreferrer"
      target="_blank"
    >
      {$t('footer.source')}
    </a>
    <a href={resolve('/legal')} class="text-ink-muted hover:text-ink">{$t('footer.licenses')}</a>
  </footer>
</div>
