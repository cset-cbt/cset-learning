<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { authClient } from '$lib/auth-client';
	import { m } from '$lib/paraglide/messages';

	let { data } = $props();
	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let error = $state('');

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		error = '';

		const result = await authClient.signIn.email({ email, password });
		loading = false;

		if (result.error) {
			error = m['login.error.invalid']();
			return;
		}

		await goto(resolve('/dashboard'));
	}

	function fillAccount(account: { email: string; password: string }) {
		email = account.email;
		password = account.password;
		error = '';
	}

	function roleLabel(role: string) {
		if (role === 'admin') return m['user.role.admin']();
		if (role === 'teacher') return m['user.role.teacher']();
		return m['user.role.student']();
	}
</script>

<Card
	class="w-full max-w-md border-[color-mix(in_oklab,var(--color-primary)_28%,var(--color-border))]"
>
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<p class="mb-3 text-xs font-bold tracking-[0.2em] text-[var(--color-primary)] uppercase">
				secure access node
			</p>
			<h1 class="text-3xl font-semibold text-[var(--color-text)]">{m['login.title']()}</h1>
			<p class="mt-2 text-sm font-medium text-[var(--color-text-muted)]">{m['login.subtitle']()}</p>
		</div>

		<form class="grid gap-5" onsubmit={submit}>
			<Input label={m['login.email']()} type="email" autocomplete="email" bind:value={email} />

			<label class="grid gap-2 text-sm font-semibold text-[var(--color-text)]" for="password">
				<span>{m['login.password']()}</span>
				<div class="relative">
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						autocomplete="current-password"
						bind:value={password}
						class="min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 pr-12 text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
					/>
					<button
						type="button"
						class="absolute top-1/2 right-1 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
						aria-label={showPassword ? m['login.hidePassword']() : m['login.showPassword']()}
						onclick={() => (showPassword = !showPassword)}
					>
						{#if showPassword}
							<svg class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<path
									d="M3 3l18 18"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
								/>
								<path
									d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
								/>
								<path
									d="M8.5 5.6A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7a12.2 12.2 0 0 1-2.7 3.8M6.2 6.9A12.4 12.4 0 0 0 2.5 12c1 2.5 4.5 7 9.5 7 1.4 0 2.7-.35 3.8-.9"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						{:else}
							<svg class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<path
									d="M2.5 12c1-2.5 4.5-7 9.5-7s8.5 4.5 9.5 7c-1 2.5-4.5 7-9.5 7s-8.5-4.5-9.5-7Z"
									stroke="currentColor"
									stroke-width="2"
									stroke-linejoin="round"
								/>
								<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
							</svg>
						{/if}
					</button>
				</div>
			</label>

			{#if error}
				<p
					class="rounded-[var(--radius-md)] bg-[var(--color-error-highlight)] px-3 py-2 text-sm font-semibold text-[var(--color-error)]"
				>
					{error}
				</p>
			{/if}

			<Button type="submit" {loading} disabled={!email || !password} size="lg">
				{loading ? m['common.loading']() : m['login.submit']()}
			</Button>
		</form>

		{#if data.devAccounts.length > 0}
			<section
				class="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3"
				aria-label={m['login.dev.title']()}
			>
				<p class="text-xs font-bold tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
					{m['login.dev.title']()}
				</p>
				<div class="mt-3 grid gap-2">
					{#each data.devAccounts as account (account.email)}
						<button
							type="button"
							class="grid min-h-11 gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left hover:border-[var(--color-primary)]"
							onclick={() => fillAccount(account)}
						>
							<span class="text-sm font-bold text-[var(--color-text)]"
								>{roleLabel(account.role)}</span
							>
							<span class="text-xs font-semibold text-[var(--color-text-muted)]">
								{account.email} / {account.password}
							</span>
						</button>
					{/each}
				</div>
				<p class="mt-3 text-xs font-semibold text-[var(--color-text-faint)]">
					{m['login.dev.hint']()}
				</p>
			</section>
		{/if}
	</div>
</Card>
