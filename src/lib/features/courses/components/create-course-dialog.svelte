<script lang="ts">
  import { Button, Dialog, InputField } from 'cset-ui';
  import { eventValue } from '$lib/core/forms/event-value';
  import { t } from '$lib/core/i18n';

  let { open = $bindable(false) }: { open?: boolean } = $props();

  let title = $state('');
  let summary = $state('');
  let coverImageUrl = $state('');
  let isSubmitting = $state(false);

  function handleClose() {
    open = false;
    title = '';
    summary = '';
    coverImageUrl = '';
  }
</script>

<Dialog
  bind:open
  title={$t('manage.createDialog.title')}
  description={$t('manage.createDialog.description')}
  size="md"
>
  <form
    method="POST"
    action="?/create"
    class="space-y-4"
    onsubmit={() => (isSubmitting = true)}
  >
    <InputField
      label={$t('manage.courseTitle')}
      name="title"
      required
      maxlength={120}
      value={title}
      oninput={(e: Event) => (title = eventValue(e))}
      placeholder="Ví dụ: Lập trình Python cơ bản..."
    />

    <InputField
      label={$t('manage.courseCoverImage')}
      name="coverImageUrl"
      maxlength={500}
      value={coverImageUrl}
      oninput={(e: Event) => (coverImageUrl = eventValue(e))}
      placeholder="https://images.unsplash.com/..."
    />

    {#if coverImageUrl.trim()}
      <div class="relative overflow-hidden rounded-md border border-border bg-surface-muted/30 aspect-video max-h-36">
        <img
          src={coverImageUrl}
          alt="Preview"
          class="h-full w-full object-cover"
          onerror={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    {/if}

    <InputField
      label={$t('manage.courseSummary')}
      name="summary"
      maxlength={280}
      multiline
      value={summary}
      oninput={(e: Event) => (summary = eventValue(e))}
      placeholder="Mô tả tóm tắt nội dung khóa học và mục tiêu đầu ra..."
    />

    <div class="flex items-center justify-end gap-3 pt-3 border-t border-border">
      <Button type="button" variant="secondary" onclick={handleClose}>
        {$t('common.cancel')}
      </Button>
      <Button type="submit" disabled={isSubmitting || !title.trim()}>
        {$t('manage.create')}
      </Button>
    </div>
  </form>
</Dialog>
