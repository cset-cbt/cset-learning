<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', children }: { class?: string; children?: import('svelte').Snippet } =
		$props();
</script>

<div
	class={cn(
		'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface)_88%,transparent)] p-[var(--space-6)] shadow-[var(--shadow-sm)] backdrop-blur',
		className
	)}
>
	{@render children?.()}
</div>
