<script lang="ts">
  import type { ExercisePlayerData } from '../shared/contract';

  let { detail }: { detail: ExercisePlayerData } = $props();
</script>

<div data-scaffold="exercise-player" data-size={JSON.stringify(detail).length}></div>
