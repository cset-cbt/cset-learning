<script lang="ts">
	let {
		label,
		type = 'text',
		placeholder = '',
		error = '',
		value = $bindable(''),
		id = crypto.randomUUID(),
		...rest
	}: {
		label: string;
		type?: string;
		placeholder?: string;
		error?: string;
		value?: string;
		id?: string;
		[key: string]: unknown;
	} = $props();
</script>

<label class="grid gap-2 text-sm font-semibold text-[var(--color-text)]" for={id}>
	<span>{label}</span>
	<input
		{id}
		{type}
		{placeholder}
		bind:value
		aria-invalid={Boolean(error)}
		aria-describedby={error ? `${id}-error` : undefined}
		class="min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
		{...rest}
	/>
	{#if error}
		<span id={`${id}-error`} class="text-sm font-medium text-[var(--color-error)]">{error}</span>
	{/if}
</label>
