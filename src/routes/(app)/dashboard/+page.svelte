<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { m } from '$lib/paraglide/messages';

	const stats = [
		{
			label: () => m['dashboard.totalUsers'](),
			value: '0',
			icon: 'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm-12 9a8 8 0 0 1 16 0H4Z'
		},
		{
			label: () => m['dashboard.totalCourses'](),
			value: '0',
			icon: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H7a3 3 0 0 0-3 3V5.5Zm3 13.5h13v2H7a1 1 0 1 1 0-2Z'
		},
		{
			label: () => m['dashboard.activeSessions'](),
			value: '0',
			icon: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm1 5h-2v6l5 3 1-1.7-4-2.3V7Z'
		}
	];
</script>

<section class="grid gap-4 md:grid-cols-3">
	{#each stats as stat (stat.label())}
		<Card class="relative overflow-hidden">
			<div
				class="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-primary),transparent)]"
			></div>
			<div class="flex items-center justify-between gap-4">
				<div>
					<p
						class="text-[0.65rem] font-bold tracking-[0.16em] text-[var(--color-text-muted)] uppercase"
					>
						{stat.label()}
					</p>
					<p class="mt-3 text-4xl font-bold tracking-[-0.08em] text-[var(--color-text)]">
						{stat.value}
					</p>
				</div>
				<div
					class="inline-flex size-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-[var(--color-primary-highlight)] text-[var(--color-primary)]"
				>
					<svg class="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d={stat.icon} />
					</svg>
				</div>
			</div>
		</Card>
	{/each}
</section>
