<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
</script>

<div
	class="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1"
	aria-label="Language"
>
	{#each ['en', 'vi'] as locale (locale)}
		<a
			href={resolve(localizeHref(page.url.pathname, { locale: locale as 'en' | 'vi' }) as Pathname)}
			data-sveltekit-reload
			class={`inline-flex min-h-9 min-w-11 items-center justify-center rounded-[var(--radius-sm)] px-3 text-xs font-bold ${getLocale() === locale ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'}`}
		>
			{locale.toUpperCase()}
		</a>
	{/each}
</div>
