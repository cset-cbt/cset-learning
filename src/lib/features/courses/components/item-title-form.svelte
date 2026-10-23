<script lang="ts">
  import { Button, InputField } from 'cset-ui';
  import { t } from '$lib/core/i18n';

  let { title }: { title: string } = $props();
</script>

<form method="POST" action="?/renameItem" class="flex flex-col gap-3 sm:flex-row sm:items-end">
  <div class="flex-1 min-w-0">
    <InputField
      label={$t('manage.itemTitle')}
      name="title"
      value={title}
      required
      maxlength={120}
    />
  </div>
  <Button type="submit" variant="secondary" class="shrink-0">
    {$t('common.rename')}
  </Button>
</form>
