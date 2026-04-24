<script lang="ts">
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { m } from '$lib/paraglide/messages';

	let { data } = $props();

	function roleVariant(role: string) {
		if (role === 'admin') return 'error';
		if (role === 'teacher') return 'warning';
		return 'primary';
	}

	function roleLabel(role: string) {
		if (role === 'admin') return m['user.role.admin']();
		if (role === 'teacher') return m['user.role.teacher']();
		return m['user.role.student']();
	}

	function fullName(user: (typeof data.users)[number]) {
		const profileName = `${user.profile?.firstName ?? ''} ${user.profile?.lastName ?? ''}`.trim();
		return profileName || user.name;
	}

	function joined(date: Date) {
		return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
	}
</script>

{#if data.users.length === 0}
	<Card>
		<div class="grid place-items-center py-12 text-center">
			<div
				class="mb-4 inline-flex size-14 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-primary-highlight)] text-[var(--color-primary)]"
			>
				<svg class="size-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm-12 9a8 8 0 0 1 16 0H4Z" />
				</svg>
			</div>
			<p class="font-semibold text-[var(--color-text)]">{m['users.empty']()}</p>
		</div>
	</Card>
{:else}
	<div
		class="hidden overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] md:block"
	>
		<table class="w-full text-left text-sm">
			<thead
				class="border-b border-[var(--color-divider)] bg-[var(--color-surface-2)] text-xs text-[var(--color-text-muted)] uppercase"
			>
				<tr>
					<th class="px-4 py-3">{m['users.avatar']()}</th>
					<th class="px-4 py-3">{m['users.fullName']()}</th>
					<th class="px-4 py-3">{m['users.email']()}</th>
					<th class="px-4 py-3">{m['users.roles']()}</th>
					<th class="px-4 py-3">{m['users.joined']()}</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-[var(--color-divider)]">
				{#each data.users as user (user.id)}
					<tr>
						<td class="px-4 py-4">
							<Avatar src={user.profile?.avatarUrl ?? user.image} name={fullName(user)} size="sm" />
						</td>
						<td class="px-4 py-4 font-semibold text-[var(--color-text)]">{fullName(user)}</td>
						<td class="px-4 py-4 text-[var(--color-text-muted)]">{user.email}</td>
						<td class="px-4 py-4">
							<div class="flex flex-wrap gap-2">
								{#each user.roles as role (role)}
									<Badge variant={roleVariant(role)}>{roleLabel(role)}</Badge>
								{/each}
							</div>
						</td>
						<td class="px-4 py-4 text-[var(--color-text-muted)]">{joined(user.createdAt)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="grid gap-3 md:hidden">
		{#each data.users as user (user.id)}
			<Card>
				<div class="flex items-start gap-3">
					<Avatar src={user.profile?.avatarUrl ?? user.image} name={fullName(user)} size="md" />
					<div class="min-w-0 flex-1">
						<p class="truncate font-bold text-[var(--color-text)]">{fullName(user)}</p>
						<p class="truncate text-sm font-medium text-[var(--color-text-muted)]">{user.email}</p>
						<div class="mt-3 flex flex-wrap gap-2">
							{#each user.roles as role (role)}
								<Badge variant={roleVariant(role)}>{roleLabel(role)}</Badge>
							{/each}
						</div>
						<p class="mt-3 text-xs font-semibold text-[var(--color-text-faint)]">
							{m['users.joined']()}: {joined(user.createdAt)}
						</p>
					</div>
				</div>
			</Card>
		{/each}
	</div>
{/if}
