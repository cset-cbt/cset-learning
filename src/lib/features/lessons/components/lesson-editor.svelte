<script lang="ts">
  import { Button, InputField, Tabs, type TabItem } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import { eventValue } from '$lib/core/forms/event-value';
  import MarkdownContent from './markdown-content.svelte';
  import AttachmentPanel from './attachment-panel.svelte';
  import type { LessonAttachment } from '../server/lesson-service';

  let { detail }: { detail: { bodyMd: string; attachments: LessonAttachment[] } } = $props();
  let draft = $derived(detail.bodyMd);
  let view = $state('write');
  const tabs = $derived<TabItem[]>([
    { value: 'write', label: $t('lesson.write') },
    { value: 'preview', label: $t('lesson.preview') }
  ]);
</script>

<div class="space-y-6">
  <form method="POST" action="?/saveLesson" class="space-y-4">
    <Tabs bind:value={view} items={tabs} />
    {#if view === 'write'}
      <InputField
        label={$t('lesson.body')}
        name="bodyMd"
        multiline
        rows="24"
        value={draft}
        oninput={(event: Event) => (draft = eventValue(event))}
      />
    {:else}
      <div class="min-h-80 rounded-sm border border-border bg-surface p-5">
        <MarkdownContent source={draft} />
      </div>
    {/if}
    <Button type="submit">{$t('common.save')}</Button>
  </form>
  <AttachmentPanel attachments={detail.attachments} />
</div>
