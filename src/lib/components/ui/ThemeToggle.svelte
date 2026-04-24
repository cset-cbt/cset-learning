<script lang="ts">
	import { getContext } from 'svelte';
	import { m } from '$lib/paraglide/messages';

	type ThemeContext = {
		theme: () => 'light' | 'dark';
		toggleTheme: () => void;
	};

	const themeContext = getContext<ThemeContext>('theme');
</script>

<button
	type="button"
	aria-label={m['theme.toggle']()}
	class="inline-flex size-11 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
	onclick={themeContext.toggleTheme}
>
	{#if themeContext.theme() === 'dark'}
		<svg class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" />
			<path
				d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
			/>
		</svg>
	{:else}
		<svg class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z"
				stroke="currentColor"
				stroke-width="2"
				stroke-linejoin="round"
			/>
		</svg>
	{/if}
</button>
