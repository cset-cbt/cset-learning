<script lang="ts">
  import { Button, InputField } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import { eventValue } from '$lib/core/forms/event-value';
  import { generateQuestionOptionId } from '../shared/question-id';

  interface OptionText {
    id: string;
    text: string;
  }

  interface Props {
    items?: OptionText[];
    label: string;
    maxItems?: number;
  }

  let { items = $bindable([]), label, maxItems = 8 }: Props = $props();

  function updateText(id: string, text: string) {
    items = items.map((item) => item.id === id ? { ...item, text } : item);
  }

  function addItem() {
    if (items.length >= maxItems) return;
    items = [...items, { id: generateQuestionOptionId(), text: '' }];
  }

  function removeItem(id: string) {
    if (items.length <= 2) return;
    items = items.filter((item) => item.id !== id);
  }
</script>

<fieldset class="space-y-3">
  <legend class="mono-label text-xs text-ink-muted">{label}</legend>
  {#each items as item, index (item.id)}
    <div class="flex items-end gap-2">
      <div class="flex-1">
        <InputField
          label={`${$t('quiz.editor.option')} ${index + 1}`}
          value={item.text}
          maxlength="300"
          oninput={(event: Event) => updateText(item.id, eventValue(event))}
        />
      </div>
      <Button type="button" variant="secondary" disabled={items.length <= 2} onclick={() => removeItem(item.id)}>
        {$t('common.delete')}
      </Button>
    </div>
  {/each}
  <Button type="button" variant="secondary" disabled={items.length >= maxItems} onclick={addItem}>
    {$t('quiz.editor.addOption')}
  </Button>
</fieldset>
