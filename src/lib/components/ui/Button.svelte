<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	type Variant = 'primary' | 'secondary' | 'ghost';
	type Size = 'sm' | 'md' | 'lg';

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		disabled = false,
		type = 'button',
		class: className = '',
		children,
		...rest
	}: {
		variant?: Variant;
		size?: Size;
		loading?: boolean;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();

	const variants: Record<Variant, string> = {
		primary:
			'bg-[var(--color-primary)] text-[var(--color-text-inverse)] shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-primary)_58%,transparent),0_10px_28px_color-mix(in_oklab,var(--color-primary)_24%,transparent)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)]',
		secondary:
			'border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-offset)]',
		ghost:
			'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
	};

	const sizes: Record<Size, string> = {
		sm: 'min-h-11 px-3 text-sm',
		md: 'min-h-11 px-4 text-sm',
		lg: 'min-h-12 px-5 text-base'
	};
</script>

<button
	{type}
	disabled={disabled || loading}
	class={cn(
		'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-semibold tracking-[-0.01em] disabled:cursor-not-allowed disabled:opacity-60',
		variants[variant],
		sizes[size],
		className
	)}
	{...rest}
>
	{#if loading}
		<svg class="size-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
			<circle
				class="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				stroke-width="4"
				fill="none"
			/>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4z" />
		</svg>
	{/if}
	{@render children?.()}
</button>
