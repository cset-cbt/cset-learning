<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { Button, Card, toast } from 'cset-ui';
  import { t } from '$lib/core/i18n';

  let { courseId, coverImageUrl }: { courseId: string; coverImageUrl?: string | null } = $props();

  let fileInput = $state<HTMLInputElement | null>(null);
  let uploadForm = $state<HTMLFormElement | null>(null);
  let removeForm = $state<HTMLFormElement | null>(null);

  let localPreview = $state<string | null>(null);
  let isUploading = $state(false);

  async function handleFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error($t('manage.cover.tooLarge'));
      return;
    }

    localPreview = URL.createObjectURL(file);
    isUploading = true;

    try {
      const formData = new FormData();
      formData.set('cover', file);

      const response = await fetch(`?/uploadCover`, {
        method: 'POST',
        body: formData,
        headers: { 'x-sveltekit-action': 'true' }
      });

      if (response.ok) {
        toast.success($t('manage.cover.saved'));
        await invalidateAll();
      } else {
        toast.error($t('manage.error.generic'));
      }
    } catch {
      toast.error($t('manage.error.generic'));
    } finally {
      isUploading = false;
    }
  }

  async function handleRemove() {
    isUploading = true;
    try {
      const response = await fetch(`?/removeCover`, {
        method: 'POST',
        headers: { 'x-sveltekit-action': 'true' }
      });
      if (response.ok) {
        localPreview = null;
        toast.success($t('manage.cover.removed'));
        await invalidateAll();
      }
    } catch {
      toast.error($t('manage.error.generic'));
    } finally {
      isUploading = false;
    }
  }
</script>

<Card class="space-y-4 p-6">
  <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
    <div>
      <h2 class="text-base font-bold text-ink">{$t('manage.cover.title')}</h2>
      <p class="mt-0.5 text-xs text-ink-muted">{$t('manage.cover.description')}</p>
    </div>

    <div class="flex items-center gap-2">
      <input
        bind:this={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        class="hidden"
        onchange={handleFileSelected}
      />

      <Button
        type="button"
        variant="secondary"
        class="h-8 px-3 text-xs"
        disabled={isUploading}
        onclick={() => fileInput?.click()}
      >
        <svg class="mr-1.5 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {isUploading ? $t('manage.cover.uploading') : $t('manage.cover.upload')}
      </Button>

      {#if localPreview || coverImageUrl}
        <Button
          type="button"
          variant="danger"
          class="h-8 px-3 text-xs"
          disabled={isUploading}
          onclick={handleRemove}
        >
          {$t('manage.cover.remove')}
        </Button>
      {/if}
    </div>
  </div>

  <!-- 16:9 Banner Preview -->
  <div class="relative overflow-hidden rounded-lg border border-border bg-surface-muted/30 aspect-video max-h-72 w-full">
    {#if localPreview || coverImageUrl}
      <img
        src={localPreview || coverImageUrl}
        alt="Course cover"
        class="h-full w-full object-cover transition-all duration-300"
      />
    {:else}
      <div class="flex h-full w-full flex-col items-center justify-center dot-grid-bg p-6 text-ink-muted">
        <svg class="h-10 w-10 text-ink-muted/50 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span class="mono-label text-xs uppercase tracking-wider">CSET BLUEPRINT BANNER</span>
        <p class="text-[0.68rem] text-ink-muted mt-1">Chưa có ảnh bìa. Nhấp "Đổi ảnh bìa" để tải ảnh lên R2.</p>
      </div>
    {/if}
  </div>
</Card>
