<script lang="ts">
	import { cn } from '$lib/utils';

	type Variant = 'default' | 'success' | 'warning' | 'error' | 'primary';

	let {
		variant = 'default',
		class: className = '',
		children
	}: {
		variant?: Variant;
		class?: string;
		children?: import('svelte').Snippet;
	} = $props();

	const variants: Record<Variant, string> = {
		default: 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]',
		success: 'bg-[var(--color-success-highlight)] text-[var(--color-success)]',
		warning: 'bg-[var(--color-warning-highlight)] text-[var(--color-warning)]',
		error: 'bg-[var(--color-error-highlight)] text-[var(--color-error)]',
		primary: 'bg-[var(--color-primary-highlight)] text-[var(--color-primary)]'
	};
</script>

<span
	class={cn(
		'inline-flex min-h-6 items-center rounded-[var(--radius-sm)] border border-current/15 px-2.5 text-[0.7rem] font-bold tracking-[0.08em] uppercase',
		variants[variant],
		className
	)}
>
	{@render children?.()}
</span>
