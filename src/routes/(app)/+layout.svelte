<script lang="ts">
  import type { Snippet } from 'svelte';
  import { navigating } from '$app/state';
  import AppFooter from '$lib/core/shell/app-footer.svelte';
  import AppHeader from '$lib/core/shell/app-header.svelte';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children?: Snippet } = $props();
</script>

<div class="relative flex min-h-[100dvh] flex-col">
  <AppHeader user={data.user} />
  <main
    class="mx-auto w-full max-w-6xl flex-1 px-4 py-8 transition-opacity duration-200 sm:px-8 {navigating.to
      ? 'pointer-events-none opacity-50'
      : 'opacity-100'}"
  >
    {@render children?.()}
  </main>
  <AppFooter />
</div>
