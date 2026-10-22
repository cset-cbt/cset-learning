<script lang="ts">
  import { Button, InputField } from 'cset-ui';
  import { t } from '$lib/core/i18n';

  let { title }: { title: string } = $props();
</script>

<form method="POST" action="?/renameItem" class="flex flex-wrap items-end gap-3">
  <InputField label={$t('manage.itemTitle')} name="title" value={title} required maxlength="120" />
  <Button type="submit" variant="secondary">{$t('common.rename')}</Button>
</form>
