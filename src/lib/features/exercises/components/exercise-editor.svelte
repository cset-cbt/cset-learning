<script lang="ts">
  import type { ExerciseEditorData } from '../shared/contract';

  let { detail }: { detail: ExerciseEditorData } = $props();
</script>

<div data-scaffold="exercise-editor" data-size={JSON.stringify(detail).length}></div>
