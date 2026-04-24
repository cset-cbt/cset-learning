<script lang="ts">
	import type { Pathname } from '$app/types';
	import { onMount, setContext } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
	let theme = $state<'light' | 'dark'>('light');

	function applyTheme(nextTheme: 'light' | 'dark') {
		theme = nextTheme;
		document.documentElement.dataset.theme = nextTheme;
	}

	function toggleTheme() {
		applyTheme(theme === 'dark' ? 'light' : 'dark');
	}

	setContext('theme', {
		theme: () => theme,
		toggleTheme
	});

	onMount(() => {
		applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{@render children()}

<div class="hidden">
	{#each locales as locale (locale)}
		<a
			href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}
			data-sveltekit-reload
		>
			{locale}
		</a>
	{/each}
</div>
