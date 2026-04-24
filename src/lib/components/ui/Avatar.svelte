<script lang="ts">
	type Size = 'sm' | 'md' | 'lg';

	let {
		src = '',
		name = '',
		size = 'md'
	}: {
		src?: string | null;
		name?: string | null;
		size?: Size;
	} = $props();

	const sizes: Record<Size, string> = {
		sm: 'size-9 text-xs',
		md: 'size-11 text-sm',
		lg: 'size-14 text-base'
	};

	const dimensions: Record<Size, number> = {
		sm: 36,
		md: 44,
		lg: 56
	};

	let initials = $derived(
		(name ?? '')
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('') || 'U'
	);
</script>

<span
	class={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-full)] bg-[var(--color-primary-highlight)] font-bold text-[var(--color-primary)] ${sizes[size]}`}
>
	{#if src}
		<img
			{src}
			alt={name ? `${name} avatar` : 'User avatar'}
			width={dimensions[size]}
			height={dimensions[size]}
			loading="lazy"
			class="size-full object-cover"
		/>
	{:else}
		{initials}
	{/if}
</span>
