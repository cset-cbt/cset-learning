<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { Avatar, Button, Card, toast } from 'cset-ui';
  import type { SessionUser } from '$lib/core/auth/session-user';
  import { isMessageKey, t } from '$lib/core/i18n';

  let { user }: { user: SessionUser } = $props();

  let previewUrl = $state<string | null>(null);
  let fileInput = $state<HTMLInputElement | null>(null);
  let uploading = $state(false);
  let removing = $state(false);
  let selectedFile = $state<File | null>(null);

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      selectedFile = file;
      previewUrl = URL.createObjectURL(file);
    }
  }

  const uploadEnhance: SubmitFunction = () => {
    uploading = true;
    return async ({ result, update }) => {
      uploading = false;
      if (result.type === 'success') {
        toast.success($t('account.avatar.saved'));
        previewUrl = null;
        selectedFile = null;
        await invalidateAll();
      } else if (result.type === 'failure') {
        const key = result.data?.error;
        toast.error($t(isMessageKey(key) ? key : 'common.error.generic'));
      }
      await update({ reset: false });
    };
  };

  const removeEnhance: SubmitFunction = () => {
    removing = true;
    return async ({ result, update }) => {
      removing = false;
      if (result.type === 'success') {
        toast.success($t('account.avatar.removed'));
        previewUrl = null;
        selectedFile = null;
        await invalidateAll();
      } else if (result.type === 'failure') {
        toast.error($t('common.error.generic'));
      }
      await update({ reset: false });
    };
  };
</script>

<Card class="space-y-5 p-6">
  <div>
    <h2 class="text-lg font-bold text-ink">{$t('account.avatar.title')}</h2>
    <p class="mt-1 text-sm text-ink-muted">{$t('account.avatar.description')}</p>
  </div>

  <div class="flex flex-wrap items-center gap-6">
    <div class="relative shrink-0">
      <Avatar src={previewUrl ?? user.image} name={user.name} size="xl" />
      {#if previewUrl}
        <span class="absolute -bottom-1 -right-1 rounded-full bg-accent px-1.5 py-0.5 font-mono text-[0.6rem] text-white">
          Preview
        </span>
      {/if}
    </div>

    <div class="space-y-3">
      <form
        method="POST"
        action="?/uploadAvatar"
        enctype="multipart/form-data"
        use:enhance={uploadEnhance}
        class="flex flex-wrap items-center gap-3"
      >
        <input
          bind:this={fileInput}
          type="file"
          name="avatar"
          accept="image/png,image/jpeg,image/webp"
          class="hidden"
          onchange={handleFileChange}
        />
        <Button
          type="button"
          variant="secondary"
          onclick={() => fileInput?.click()}
        >
          {$t('account.avatar.choose')}
        </Button>

        {#if selectedFile}
          <span class="max-w-xs truncate font-mono text-xs text-ink-muted">
            {selectedFile.name}
          </span>
          <Button type="submit" disabled={uploading}>
            {$t('account.avatar.upload')}
          </Button>
        {/if}
      </form>

      {#if user.image && !selectedFile}
        <form method="POST" action="?/removeAvatar" use:enhance={removeEnhance}>
          <Button type="submit" variant="danger" disabled={removing}>
            {$t('account.avatar.remove')}
          </Button>
        </form>
      {/if}
    </div>
  </div>
</Card>
