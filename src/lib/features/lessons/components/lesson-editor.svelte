<script lang="ts">
  import { Button, Card, Tabs, type TabItem } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import { eventValue } from '$lib/core/forms/event-value';
  import RichToolbar from './rich-toolbar.svelte';
  import MarkdownContent from './markdown-content.svelte';
  import AttachmentPanel from './attachment-panel.svelte';
  import type { LessonAttachment } from '../server/lesson-service';
  let { detail }: { detail: { bodyMd: string; attachments: LessonAttachment[] } } = $props();
  // svelte-ignore state_referenced_locally
  let draft = $state(detail.bodyMd);
  let view = $state<'write' | 'split' | 'preview'>('write');
  let textareaEl = $state<HTMLTextAreaElement | null>(null);

  const tabs = $derived<TabItem[]>([
    { value: 'write', label: $t('lesson.write') },
    { value: 'split', label: $t('lesson.split') },
    { value: 'preview', label: $t('lesson.preview') }
  ]);

  function getSelection() {
    if (!textareaEl) return { start: 0, end: 0, text: '' };
    const start = textareaEl.selectionStart;
    const end = textareaEl.selectionEnd;
    const text = draft.substring(start, end);
    return { start, end, text };
  }

  function setSelection(start: number, end: number) {
    if (!textareaEl) return;
    requestAnimationFrame(() => {
      textareaEl?.focus();
      textareaEl?.setSelectionRange(start, end);
    });
  }

  function wrapSelection(prefix: string, suffix: string, placeholder = 'văn bản') {
    const { start, end, text } = getSelection();
    const content = text || placeholder;
    const replacement = `${prefix}${content}${suffix}`;
    draft = draft.substring(0, start) + replacement + draft.substring(end);
    setSelection(start + prefix.length, start + prefix.length + content.length);
  }

  function prefixLines(prefix: string) {
    const { start, end, text } = getSelection();
    if (!text) {
      const lineStart = draft.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = draft.indexOf('\n', start);
      const actualEnd = lineEnd === -1 ? draft.length : lineEnd;
      const line = draft.substring(lineStart, actualEnd);
      draft = draft.substring(0, lineStart) + prefix + line.replace(/^#+\s*|^>\s*|^[-*]\s*|^\d+\.\s*/, '') + draft.substring(actualEnd);
      setSelection(lineStart + prefix.length, lineStart + prefix.length);
      return;
    }
    const lines = text.split('\n');
    const transformed = lines.map((l) => `${prefix}${l.replace(/^#+\s*|^>\s*|^[-*]\s*|^\d+\.\s*/, '')}`).join('\n');
    draft = draft.substring(0, start) + transformed + draft.substring(end);
    setSelection(start, start + transformed.length);
  }

  function insertBlock(snippet: string) {
    const { start, end } = getSelection();
    const before = draft.substring(0, start);
    const after = draft.substring(end);
    const needsNewlineBefore = before.length > 0 && !before.endsWith('\n\n');
    const prefix = needsNewlineBefore ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
    draft = before + prefix + snippet + after;
    setSelection(start + prefix.length, start + prefix.length + snippet.length);
  }

  function handleToolbarAction(action: string, param?: string) {
    switch (action) {
      case 'bold': wrapSelection('**', '**', 'văn bản in đậm'); break;
      case 'italic': wrapSelection('*', '*', 'văn bản in nghiêng'); break;
      case 'strikethrough': wrapSelection('~~', '~~', 'văn bản gạch ngang'); break;
      case 'code': wrapSelection('`', '`', 'mã code'); break;
      case 'heading':
        if (param === 'h1') prefixLines('# ');
        else if (param === 'h2') prefixLines('## ');
        else if (param === 'h3') prefixLines('### ');
        else prefixLines('');
        break;
      case 'quote': prefixLines('> '); break;
      case 'bulletList': prefixLines('- '); break;
      case 'numberList': prefixLines('1. '); break;
      case 'taskList': prefixLines('- [ ] '); break;
      case 'hr': insertBlock('---\n'); break;
      case 'math': wrapSelection('$$ ', ' $$', '\\sum_{i=1}^{N} i = \\frac{N(N+1)}{2}'); break;
      case 'codeBlock': insertBlock('```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n```\n'); break;
      case 'table': insertBlock('| Tiêu đề 1 | Tiêu đề 2 | Tiêu đề 3 |\n| :--- | :--- | :--- |\n| Nội dung 1 | Nội dung 2 | Nội dung 3 |\n| Nội dung 4 | Nội dung 5 | Nội dung 6 |\n'); break;
      case 'link': wrapSelection('[', '](https://example.com)', 'Tiêu đề liên kết'); break;
      case 'image': insertBlock('![Mô tả hình ảnh](https://images.unsplash.com/...)\n'); break;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
      event.preventDefault();
      handleToolbarAction('bold');
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
      event.preventDefault();
      handleToolbarAction('italic');
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      handleToolbarAction('link');
    } else if (event.key === 'Tab') {
      event.preventDefault();
      const { start, end } = getSelection();
      draft = draft.substring(0, start) + '  ' + draft.substring(end);
      setSelection(start + 2, start + 2);
    }
  }
</script>

<div class="space-y-6">
  <form method="POST" action="?/saveLesson" class="space-y-4">
    <div class="flex items-center justify-between border-b border-border pb-2">
      <Tabs bind:value={view} items={tabs} />
      <span class="mono-label text-[0.68rem] text-ink-muted">
        {draft.length} ký tự
      </span>
    </div>

    <!-- Mode 1: Write (Rich Editor with Word-like Toolbar) -->
    {#if view === 'write'}
      <Card class="overflow-hidden p-0 border border-border shadow-xs">
        <RichToolbar onAction={handleToolbarAction} />
        <textarea
          bind:this={textareaEl}
          name="bodyMd"
          bind:value={draft}
          onkeydown={handleKeydown}
          rows="22"
          class="w-full resize-y bg-surface p-4 font-mono text-sm leading-relaxed text-ink focus:outline-none"
          placeholder="Nhập nội dung bài học..."
        ></textarea>
      </Card>
    {/if}

    <!-- Mode 2: Split View (Side-by-side Editor & Live Rendered Document) -->
    {#if view === 'split'}
      <div class="grid gap-6 lg:grid-cols-2">
        <Card class="overflow-hidden p-0 border border-border shadow-xs flex flex-col">
          <RichToolbar onAction={handleToolbarAction} />
          <textarea
            bind:this={textareaEl}
            name="bodyMd"
            bind:value={draft}
            onkeydown={handleKeydown}
            rows="24"
            class="w-full flex-1 resize-y bg-surface p-4 font-mono text-xs leading-relaxed text-ink focus:outline-none"
            placeholder="Nhập nội dung bài học..."
          ></textarea>
        </Card>

        <Card class="max-h-[700px] overflow-y-auto border border-border bg-surface p-6 shadow-xs">
          <div class="mb-3 border-b border-border pb-2">
            <span class="mono-label text-[0.68rem] text-accent uppercase font-bold">XEM TRƯỚC THỜI GIAN THỰC</span>
          </div>
          <MarkdownContent source={draft} />
        </Card>
      </div>
    {/if}

    <!-- Mode 3: Full Preview -->
    {#if view === 'preview'}
      <Card class="min-h-96 rounded-lg border border-border bg-surface p-6 sm:p-8 shadow-xs">
        <MarkdownContent source={draft} />
      </Card>
    {/if}

    <div class="flex items-center justify-between pt-2">
      <Button type="submit">{$t('common.save')}</Button>
      <span class="font-mono text-xs text-ink-muted">
        Phím tắt: Ctrl+B (Đậm), Ctrl+I (Nghiêng), Ctrl+K (Link), Tab (Thụt dòng)
      </span>
    </div>
  </form>

  <AttachmentPanel attachments={detail.attachments} />
</div>
