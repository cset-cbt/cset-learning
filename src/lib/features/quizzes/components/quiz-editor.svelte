<script lang="ts">
  import type { QuizEditorData } from '../shared/contract';

  let { detail }: { detail: QuizEditorData } = $props();
</script>

<div data-scaffold="quiz-editor" data-size={JSON.stringify(detail).length}></div>
