<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import { Toaster } from 'cset-ui';
  import { initializeLocale, t } from '$lib/core/i18n';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children?: Snippet } = $props();

  onMount(() => initializeLocale(data.locale));
</script>

<svelte:head>
  <title>{$t('app.title')}</title>
  <meta name="description" content={$t('app.description')} />
</svelte:head>

{@render children?.()}
<Toaster />
