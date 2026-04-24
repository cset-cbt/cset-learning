<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { page } from '$app/state';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import LangSwitch from '$lib/components/ui/LangSwitch.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import { authClient } from '$lib/auth-client';
	import { m } from '$lib/paraglide/messages';

	let { data, children } = $props();

	const navItems = [
		{
			href: '/dashboard',
			label: () => m['nav.dashboard'](),
			icon: 'M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-11h6V4h-6v5Z'
		},
		{
			href: '/courses',
			label: () => m['nav.courses'](),
			icon: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H7a3 3 0 0 0-3 3V5.5Zm3 13.5h13v2H7a1 1 0 1 1 0-2Z'
		},
		{
			href: '/users',
			label: () => m['nav.users'](),
			icon: 'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm-12 9a8 8 0 0 1 16 0H4Zm15-9a3 3 0 0 0-2.1-2.86 5.98 5.98 0 0 1 0 5.72A3 3 0 0 0 19 11Zm1.4 9a9.96 9.96 0 0 0-2.05-4.1A6 6 0 0 1 24 20h-3.6Z'
		},
		{
			href: '/settings',
			label: () => m['nav.settings'](),
			icon: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm9 4a7.94 7.94 0 0 0-.12-1.37l2.02-1.57-2-3.46-2.38.96a8.12 8.12 0 0 0-2.37-1.37L15.8 2h-4l-.36 3.19a8.12 8.12 0 0 0-2.37 1.37L6.7 5.6l-2 3.46 2.02 1.57a8.2 8.2 0 0 0 0 2.74L4.7 14.94l2 3.46 2.38-.96a8.12 8.12 0 0 0 2.37 1.37l.36 3.19h4l.36-3.19a8.12 8.12 0 0 0 2.37-1.37l2.38.96 2-3.46-2.02-1.57c.08-.45.12-.9.12-1.37Z'
		}
	];

	let primaryRole = $derived(data.roles[0] ?? 'student');
	let displayName = $derived(
		data.profile?.firstName
			? `${data.profile.firstName} ${data.profile.lastName ?? ''}`.trim()
			: data.user.name
	);
	let pageTitle = $derived(
		page.url.pathname.startsWith('/users')
			? m['nav.users']()
			: page.url.pathname.startsWith('/courses')
				? m['nav.courses']()
				: page.url.pathname.startsWith('/settings')
					? m['nav.settings']()
					: m['nav.dashboard']()
	);

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}

	function roleLabel(role: string) {
		if (role === 'admin') return m['user.role.admin']();
		if (role === 'teacher') return m['user.role.teacher']();
		return m['user.role.student']();
	}

	function roleVariant(role: string) {
		if (role === 'admin') return 'error';
		if (role === 'teacher') return 'warning';
		return 'primary';
	}

	async function signOut() {
		await authClient.signOut();
		await goto(resolve('/login'));
	}

	function href(path: string) {
		return resolve(path as Pathname);
	}
</script>

<div class="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
	<aside
		class="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-[var(--color-divider)] bg-[color-mix(in_oklab,var(--color-surface)_90%,transparent)] shadow-[var(--shadow-md)] backdrop-blur lg:flex"
	>
		<div class="flex h-20 items-center gap-3 border-b border-[var(--color-divider)] px-6">
			<div
				class="inline-flex size-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-[var(--color-primary-highlight)] text-[var(--color-primary)]"
			>
				<svg viewBox="0 0 24 24" class="size-7" fill="none" aria-hidden="true">
					<path
						d="M4 5.5c3.5 0 6 .9 8 2.5 2-1.6 4.5-2.5 8-2.5v13c-3.5 0-6 .9-8 2.5-2-1.6-4.5-2.5-8-2.5v-13Z"
						stroke="currentColor"
						stroke-width="2"
						stroke-linejoin="round"
					/>
					<path d="M12 8v13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
				</svg>
			</div>
			<div>
				<p class="text-base font-bold tracking-[-0.03em]">CSET Learning</p>
				<p
					class="text-[0.65rem] font-bold tracking-[0.18em] text-[var(--color-text-muted)] uppercase"
				>
					control plane
				</p>
			</div>
		</div>

		<nav class="grid gap-1 px-3 py-4" aria-label="Main navigation">
			{#each navItems as item (item.href)}
				<a
					href={href(item.href)}
					class={`flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] border px-3 text-sm font-semibold ${isActive(item.href) ? 'border-[var(--color-primary)] bg-[var(--color-primary-highlight)] text-[var(--color-primary)] shadow-[0_0_24px_color-mix(in_oklab,var(--color-primary)_15%,transparent)]' : 'border-transparent text-[var(--color-text-muted)] hover:border-[var(--color-border)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'}`}
				>
					<svg class="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d={item.icon} />
					</svg>
					{item.label()}
				</a>
			{/each}
		</nav>

		<div class="mt-auto border-t border-[var(--color-divider)] p-4">
			<div class="mb-3 flex items-center gap-3">
				<Avatar src={data.profile?.avatarUrl ?? data.user.image} name={displayName} size="md" />
				<div class="min-w-0">
					<p class="truncate text-sm font-bold">{displayName}</p>
					<Badge variant={roleVariant(primaryRole)}>{roleLabel(primaryRole)}</Badge>
				</div>
			</div>
			<button
				type="button"
				class="flex min-h-11 w-full items-center justify-center rounded-[var(--radius-md)] text-sm font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
				onclick={signOut}
			>
				{m['nav.logout']()}
			</button>
		</div>
	</aside>

	<div class="lg:pl-72">
		<header
			class="sticky top-0 z-20 flex min-h-20 items-center justify-between border-b border-[var(--color-divider)] bg-[color-mix(in_oklab,var(--color-bg)_86%,transparent)] px-4 backdrop-blur md:px-8"
		>
			<div>
				<p
					class="mb-1 text-[0.65rem] font-bold tracking-[0.2em] text-[var(--color-primary)] uppercase"
				>
					/ platform
				</p>
				<h1 class="text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text)] md:text-3xl">
					{pageTitle}
				</h1>
			</div>
			<div class="flex items-center gap-2">
				<ThemeToggle />
				<LangSwitch />
			</div>
		</header>

		<main class="px-4 py-6 pb-28 md:px-8 lg:pb-8">
			{@render children()}
		</main>
	</div>

	<nav
		class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[var(--color-divider)] bg-[var(--color-surface)] px-2 py-2 shadow-[var(--shadow-lg)] lg:hidden"
		aria-label="Mobile navigation"
	>
		{#each navItems as item (item.href)}
			<a
				href={href(item.href)}
				class={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] text-xs font-bold ${isActive(item.href) ? 'bg-[var(--color-primary-highlight)] text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
			>
				<svg class="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d={item.icon} />
				</svg>
				{item.label()}
			</a>
		{/each}
	</nav>
</div>
