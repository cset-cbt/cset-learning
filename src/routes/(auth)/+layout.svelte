<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	let { children } = $props();
</script>

<div
	class="grid min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] lg:grid-cols-[minmax(380px,0.95fr)_1.05fr]"
>
	<section
		class="hidden items-center justify-center border-r border-[color-mix(in_oklab,var(--color-border)_70%,transparent)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-surface)_84%,transparent),color-mix(in_oklab,var(--color-primary-highlight)_35%,transparent))] p-12 text-[var(--color-text)] lg:flex"
		aria-label="CSET Learning"
	>
		<div class="max-w-md">
			<div
				class="mb-8 inline-flex size-20 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-primary)] bg-[var(--color-primary-highlight)] text-[var(--color-primary)] shadow-[0_0_40px_color-mix(in_oklab,var(--color-primary)_22%,transparent)]"
			>
				<svg viewBox="0 0 24 24" class="size-12" fill="none" aria-hidden="true">
					<path
						d="M4 5.5c3.5 0 6 .9 8 2.5 2-1.6 4.5-2.5 8-2.5v13c-3.5 0-6 .9-8 2.5-2-1.6-4.5-2.5-8-2.5v-13Z"
						stroke="currentColor"
						stroke-width="2"
						stroke-linejoin="round"
					/>
					<path d="M12 8v13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
				</svg>
			</div>
			<p class="mb-4 text-xs font-bold tracking-[0.24em] text-[var(--color-primary)] uppercase">
				CSET Learning / LMS Core
			</p>
			<p class="text-4xl leading-tight font-[var(--font-display)]">{m['auth.tagline']()}</p>
			<div class="mt-8 grid grid-cols-3 gap-2 text-xs font-bold text-[var(--color-text-muted)]">
				<span
					class="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
					>AUTH</span
				>
				<span
					class="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
					>WS API</span
				>
				<span
					class="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
					>I18N</span
				>
			</div>
		</div>
	</section>

	<main class="flex min-h-screen items-center justify-center px-4 py-10">
		{@render children()}
	</main>
</div>
