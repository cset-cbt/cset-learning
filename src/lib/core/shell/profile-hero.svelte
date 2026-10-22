<script lang="ts">
  import { Avatar, Badge, Card, toast } from 'cset-ui';
  import type { SessionUser } from '$lib/core/auth/session-user';
  import { locale, t } from '$lib/core/i18n';

  let { user }: { user: SessionUser } = $props();

  const roleColor = $derived<'rose' | 'purple' | 'emerald'>(
    user.role === 'admin' ? 'rose' : user.role === 'instructor' ? 'purple' : 'emerald'
  );

  const formattedDate = $derived(
    user.createdAt
      ? new Date(user.createdAt).toLocaleDateString($locale === 'vi' ? 'vi-VN' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : '2026'
  );

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(user.email);
      toast.success(user.email);
    } catch {
      // Fallback
    }
  }
</script>

<Card class="relative w-full overflow-hidden p-6 sm:p-8 dot-grid-bg">
  <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div class="relative shrink-0">
        <Avatar src={user.image} name={user.name} size="xl" status="online" />
      </div>

      <div class="space-y-1.5">
        <div class="flex flex-wrap items-center gap-2.5">
          <h1 class="font-sans text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {user.name}
          </h1>
          <Badge variant="soft" color={roleColor} size="md">
            {$t(`account.role.${user.role}`)}
          </Badge>
        </div>

        <div class="flex flex-wrap items-center gap-3 font-mono text-xs text-ink-muted">
          <button
            type="button"
            class="flex items-center gap-1.5 hover:text-accent cursor-pointer transition-colors"
            onclick={copyEmail}
            title="Copy email"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            <span>{user.email}</span>
          </button>
          <span>•</span>
          <span>{$t('account.hero.joined', { date: formattedDate })}</span>
        </div>
      </div>
    </div>

    <div class="border-t border-border pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 shrink-0">
      <p class="mono-label text-[0.68rem] text-ink-muted uppercase">SYSTEM ACCESS</p>
      <p class="font-mono text-xs font-semibold text-ink mt-1">
        {$t(`account.role.${user.role}`)}
      </p>
      <p class="font-mono text-[0.62rem] text-ink-muted mt-0.5">
        ID: {user.id.slice(0, 8)}...
      </p>
    </div>
  </div>
</Card>
